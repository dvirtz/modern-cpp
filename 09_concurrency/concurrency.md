<!-- .slide: data-background-image="09_concurrency/martial.jpg" -->

---

<!-- .slide: id="concurrency" data-background-image="09_concurrency/speed.webp" -->

<div class="footnote">

Source: [C++ Concurrency in Action, Anthony Williams](https://www.manning.com/books/c-plus-plus-concurrency-in-action-second-edition)

</div>

# Concurrency

<!-- .element: class="chapter" -->

Note: Until C++11 came the standard didn't acknowledge the existence of multithreaded applications. But since then there were many additions to support concurrent programming.

---

## hello `std::thread`

```cpp
///compiler=clang600
///options=-pthread
#include <iostream>
#include <thread>

int main()
{
    std::thread t([]{
      std::cout<<"Hello Concurrent World\n";
    });
    t.join();
}
```

Note: forgetting to join with terminate the program

---

## on exception


```cpp [1-3,10-11,16-23]
///compiler=clang600
///options=-pthread
///hide
#include <iostream>
#include <thread>
#include <stdexcept>

///unhide
void can_throw() {
    throw std::runtime_error("error");
}

void foo()
{
    std::thread t([]{
      std::cout<<"Hello Concurrent World\n";
    });
    can_throw();
    t.join();
}

int main()
{
  try {
    foo();
  } catch (const std::exception& ex) {
    std::cerr 
      << "got exception: " 
      << ex.what() 
      << '\n';
  }
}


```

<!-- .element: class="split" -->

---

## catch that


```cpp [10-16]
///compiler=clang600
///options=-pthread
///hide
#include <iostream>
#include <thread>
#include <stdexcept>

///unhide
void can_throw() {
    throw std::runtime_error("error");
}

void foo()
{
    std::thread t([]{
      std::cout<<"Hello Concurrent World\n";
    });
    try {
      can_throw();
    } catch(...) {
      t.join();
      throw;
    }
    t.join();
}

int main()
{
  try {
    foo();
  } catch (const std::exception& ex) {
    std::cerr 
      << "got exception: " 
      << ex.what() 
      << '\n';
  }
}






```

<!-- .element: class="split" -->

---

## RAII style

```cpp
///hide
#include <thread>

///unhide
class thread_joiner
{
public:
    explicit thread_joiner(std::thread& thread)
      : m_thread{thread}
    {}
    ~thread_joiner()
    {
      if(m_thread.joinable())
      {
        m_thread.join();
      }
    }
private:
    std::thread& m_thread;
};
```

<!-- .element: style="font-size: 0.5em" -->

Note: checking `joinable()` is important because `join()` will fail if the thread had already been joined

---

## use joiner

```cpp [7-11]
///compiler=clang600
///options=-pthread
///hide
#include <iostream>
#include <thread>
#include <stdexcept>

class thread_joiner
{
public:
    explicit thread_joiner(std::thread& thread)
      : m_thread{thread}
    {}
    ~thread_joiner()
    {
      if(m_thread.joinable())
      {
        m_thread.join();
      }
    }
private:
    std::thread& m_thread;
};

///unhide
void can_throw() {
    throw std::runtime_error("error");
}

void foo()
{
    std::thread t([]{
      std::cout<<"Hello Concurrent World\n";
    });
    thread_joiner joiner{t};
    can_throw();
}

int main()
{
  try {
    foo();
  } catch (const std::exception& ex) {
    std::cerr 
      << "got exception: " 
      << ex.what() 
      << '\n';
  }
}


```

<!-- .element: class="split" -->

---

## document editor

![word tabs](09_concurrency/word_tabs.png)

Note: We run each document-editing window in its own thread. Opening a new document therefore requires starting a new thread. The thread handling the request isn’t going to care about waiting for that other thread to finish, because it’s working on an unrelated document, so this makes it a prime candidate for running a detached thread.

---

## `detach` and passing arguments

```cpp [1-4,12-17]
///hide
#include <string>
#include <thread>

///unhide
enum class user_command
{
  open_new_document
};

///hide
void open_document_and_display_gui(const std::string);
bool done_editing();
user_command get_user_input();
std::string get_filename_from_user();
void process_user_input(user_command);

///unhide
void edit_document(const std::string& filename)
{
    open_document_and_display_gui(filename);
    while(!done_editing())
    {
        const auto cmd = get_user_input();
        if(cmd == user_command::open_new_document)
        {
            const auto new_name = get_filename_from_user();
            std::thread t(edit_document, new_name);
            t.detach();
        }
        else
        {
            process_user_input(cmd);
        }
    }
}
```

<!-- .element: style="font-size: 0.35em" -->

---

## lvalue reference?

```cpp []
///fails=std::thread arguments must be invocable after conversion to rvalues
///hide
#include <thread>
#include <fstream>

///unhide
void readFile(int& i) {
  std::fstream f{"input.txt"};
  f >> i;
}

///hide
void use() {
///unhide
int i;
std::thread t{readFile, i};
t.join();
///hide
}
```

<!-- .element: style="font-size: 0.35em" -->

---

<!-- .slide: class="aside" -->

## `std::reference_wrapper`

a copyable, assignable reference

```cpp
///hide
#include <iostream>
///unhide
#include <functional>

///hide
int main() {
///unhide
int x = 10, y = 20;
std::reference_wrapper<int> ref = x;
// ref = 15; // doesn't compile
x = 15;
std::cout << ref << '\n'; // prints 15
ref = y; // now bound to y
int& yy = ref;
yy = 25;
std::cout << y << '\n'; // prints 25
///hide
}
```

---

<!-- .slide: class="aside" -->

## `std::ref`, `std::cref`

```cpp
///hide
#include <type_traits>
///unhide
#include <functional>

///hide
int main() {
///unhide
int x = 10;

auto xref = std::ref(x);
static_assert(std::is_same<decltype(xref), 
  std::reference_wrapper<int>>::value,
  "non const");

auto cxref = std::cref(x);
static_assert(std::is_same<decltype(cxref), 
  std::reference_wrapper<const int>>::value,
  "const");
///hide
}
```

---

<!-- .slide: class="aside" -->

## counting sort comparisons

```cpp
///hide
#include <algorithm>
#include <functional>
#include <iostream>
#include <numeric>
#include <vector>

///unhide
struct counting_less {
  template<typename T> 
  bool operator()(const T& x, const T& y) {
    ++count;
    return x < y;
  }

  int count = 0;
};

///hide
int main() {
///unhide
std::vector<int> elements{5, 3, 7, 2, 0};
counting_less cl;
std::sort(elements.begin(), elements.end(), cl);
std::cout << cl.count << " comparisons in sort\n";
///hide
}
```

---

## back to `thread`

```cpp [7]
///hide
#include <thread>
#include <fstream>

///unhide
void readFile(int& i) {
  std::fstream f{"input.txt"};
  f >> i;
}

///hide
void use() {
///unhide
int i;
std::thread t{readFile, std::ref(i)};
t.join();
///hide
}
```

<!-- .element: style="font-size: 0.35em" -->

---

<!-- .slide: class="aside" id="next_prev" -->

## generic iterator traversal

before:

```cpp
template<typename Iterator>
auto get_3rd_from(Iterator it) ->decltype(*it) {
  return *(++(++(++it)));
}
```

after:

```cpp
#include <iterator>

template<typename Iterator>
auto get_3rd_to_last(Iterator it) ->decltype(*it) {
  return *std::next(it, 3);
}
```

---

## owning `thread_joiner`

```cpp [4-5,14-17,19]
///hide
#include <thread>

///unhide
class thread_joiner
{
public:
    explicit thread_joiner(std::thread thread)
      : m_thread{std::move(thread)}
    {}
    ~thread_joiner() {
      if(m_thread.joinable())
      {
        m_thread.join();
      }
    }
    thread_joiner(const thread_joiner&) = delete;
    thread_joiner(thread_joiner&&) = default;
    thread_joiner& operator=(const thread_joiner&) = delete;
    thread_joiner& operator=(thread_joiner&&) = default;
private:
    std::thread m_thread;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

## parallel accumulate

```cpp [1-2|3-4|6-10|12-16|19-23,28|24-27|30|33|37-40]
///compiler=clang600
///options=-pthread
///hide
#include <thread>
#include <numeric>
#include <algorithm>
#include <vector>
#include <iostream>

class thread_joiner
{
public:
    explicit thread_joiner(std::thread thread)
      : m_thread{std::move(thread)}
    {}
    ~thread_joiner()
    {
      if(m_thread.joinable())
      {
        m_thread.join();
      }
    }
    thread_joiner(const thread_joiner&) = delete;
    thread_joiner(thread_joiner&&) = default;
    thread_joiner& operator=(const thread_joiner&) = delete;
    thread_joiner& operator=(thread_joiner&&) = default;
private:
    std::thread m_thread;
};

///unhide
template <typename Iterator, typename T, size_t MIN_PER_THREAD = 25>
T parallel_accumulate(Iterator first, Iterator last, T init) {
  const auto length = std::distance(first, last);
  if (!length) return init;

  const auto max_threads = (length + MIN_PER_THREAD - 1) / MIN_PER_THREAD;
  const auto hardware_threads = std::thread::hardware_concurrency();
  const auto num_threads =
      std::min<size_t>(hardware_threads != 0 ? hardware_threads : 2, 
                       max_threads);

  const auto block_size = length / num_threads;
  std::vector<T> results(num_threads);
  const auto accumulator = [](Iterator first, Iterator last, T& result) {
      result = std::accumulate(first, last, 0);
  };

  {
    std::vector<thread_joiner> threads;
    auto block_start = first;
    std::transform(results.begin(), std::prev(results.end()), 
                   std::back_inserter(threads), 
                   [&](T& result){
        const auto block_end = std::next(block_start, block_size);
        std::thread t{accumulator, block_start, block_end, std::ref(result)};
        block_start = block_end;
        return thread_joiner{std::move(t)};
    });

    accumulator(block_start, last, results.back());
  }
  
  return std::accumulate(results.begin(), results.end(), init);
}

int main() {
    std::vector<int64_t> v(10000);
    std::iota(v.begin(), v.end(), 1);

    std::cout << parallel_accumulate(v.begin(), v.end(), 0) << '\n';
}
```

<!-- .element: "style="font-size: 0.4em" -->

---

<!-- .slide: data-background-image="09_concurrency/sharing.gif" -->

## data sharing

<!-- .element: class="chapter bottom" -->

Note: As opposed to multi-process program, it is much easier to share data between different threads but that of course opens the door to data races. Let's see what tools we have to address this issue.

---

<!-- .slide: data-auto-animate -->

## protecting with a `mutex`

```cpp [4,8,10,15,18]
///hide
#include <list>
#include <algorithm>
///unhide
#include <mutex>

std::list<int> some_list;
std::mutex some_mutex;

void add_to_list(int new_value)
{
    some_mutex.lock();
    some_list.push_back(new_value);
    some_mutex.unlock();
}

bool list_contains(int value_to_find)
{
    some_mutex.lock();
    return std::find(some_list.begin(), some_list.end(), value_to_find)
        != some_list.end();
    some_mutex.unlock();
}
```

<!-- .element: data-id="code" style="font-size:0.4em" -->

---

<!-- .slide: data-auto-animate -->

## RAII with a `lock_guard`

```cpp [4,8,14]
///hide
#include <list>
#include <algorithm>
///unhide
#include <mutex>

std::list<int> some_list;
std::mutex some_mutex;

void add_to_list(int new_value)
{
    std::lock_guard<std::mutex> guard(some_mutex);
    some_list.push_back(new_value);
}

bool list_contains(int value_to_find)
{
    std::lock_guard<std::mutex> guard(some_mutex);
    return std::find(some_list.begin(), some_list.end(), value_to_find)
        != some_list.end();
}
```

<!-- .element: data-id="code" style="font-size:0.4em" -->

---

<!-- .slide: data-auto-animate -->

## locking multiple mutexes

```cpp [8-14|18-20]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <vector>

///unhide
class X
{
private:
    std::vector<int> vec;
    std::mutex m;
public:
    X(const std::vector<int>& vec): vec{vec} {}
    friend void swap(X& lhs, X& rhs)
    {
        if(&lhs==&rhs) return;
        std::lock_guard<std::mutex> lock_a{lhs.m};
        std::lock_guard<std::mutex> lock_b{rhs.m};
        std::swap(lhs.vec, rhs.vec);
    }
};

///hide
int main() {
std::vector<int> i1, i2; 
///unhide
X x1{i1}, x2{i2};
std::thread t1{[&]{ swap(x1, x2); }};
std::thread t2{[&]{ swap(x2, x1); }};
///hide
t1.join();
t2.join();
}
```

<!-- .element: data-id="code2" style="font-size:0.4em" -->

---

<!-- .slide: data-auto-animate -->

## use `std::lock`

```cpp [11-13]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <vector>

///unhide
class X
{
private:
    std::vector<int> vec;
    std::mutex m;
public:
    X(const std::vector<int>& vec): vec{vec} {}
    friend void swap(X& lhs, X& rhs)
    {
        if(&lhs==&rhs) return;
        std::lock(lhs.m, rhs.m);
        std::lock_guard<std::mutex> lock_a{lhs.m, std::adopt_lock};
        std::lock_guard<std::mutex> lock_b{rhs.m, std::adopt_lock};
        std::swap(lhs.vec, rhs.vec);
    }
};

///hide
int main() {
std::vector<int> i1, i2; 
///unhide
X x1{i1}, x2{i2};
std::thread t1{[&]{ swap(x1, x2); }};
std::thread t2{[&]{ swap(x2, x1); }};
///hide
t1.join();
t2.join();
}
```

<!-- .element: data-id="code2" style="font-size:0.4em" -->

---

<!-- .slide: id="scoped_lock" data-auto-animate -->

## use `std::scoped_lock` (C++17)

```cpp [11]
///compiler=clang600
///options=-std=c++17 -pthread
///hide
#include <mutex>
#include <thread>
#include <vector>

///unhide
class X
{
private:
    std::vector<int> vec;
    std::mutex m;
public:
    X(const std::vector<int>& vec): vec{vec} {}
    friend void swap(X& lhs, X& rhs)
    {
        if(&lhs==&rhs) return;
        std::scoped_lock<std::mutex,std::mutex> guard{lhs.m, rhs.m};
        std::swap(lhs.vec, rhs.vec);
    }
};

///hide
int main() {
std::vector<int> i1, i2; 
///unhide
X x1{i1}, x2{i2};
std::thread t1{[&]{ swap(x1, x2); }};
std::thread t2{[&]{ swap(x2, x1); }};
///hide
t1.join();
t2.join();
}
```

<!-- .element: data-id="code2" style="font-size:0.4em" -->

---

<!-- .slide: data-auto-animate -->

## or use `std::unique_lock`

```cpp [11-13]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <vector>

///unhide
class X
{
private:
    std::vector<int> vec;
    std::mutex m;
public:
    X(const std::vector<int>& vec): vec{vec} {}
    friend void swap(X& lhs, X& rhs)
    {
        if(&lhs==&rhs) return;
        std::unique_lock<std::mutex> lock_a{lhs.m,std::defer_lock};
        std::unique_lock<std::mutex> lock_b{rhs.m,std::defer_lock};
        std::lock(lock_a,lock_b);
        std::swap(lhs.vec, rhs.vec);
    }
};

///hide
int main() {
std::vector<int> i1, i2; 
///unhide
X x1{i1}, x2{i2};
std::thread t1{[&]{ swap(x1, x2); }};
std::thread t2{[&]{ swap(x2, x1); }};
///hide
t1.join();
t2.join();
}
```

<!-- .element: data-id="code2" style="font-size:0.4em" -->

Note: `unique_lock` has more features than `lock_guard` but is also more expensive.

---

## transferring mutex ownership

```cpp [1-2,20,21|4-17|24-31]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <vector>
#include <thread>

///unhide
template<typename T>
class Synchronized {
public:
    struct Locked {
      std::unique_lock<std::mutex> m_lock;
      T* m_data;

      Locked(std::mutex& mutex, T& data)
        : m_lock{mutex}
        , m_data{&data}
      {}

      T* operator->() { return m_data; }
    };
    Locked operator->() {
        return {m_mutex, m_data};
    }

private:
    std::mutex m_mutex;
    T m_data;
};
int main() {
    Synchronized<std::vector<int>> pv;
    auto foo = [&pv]{
        pv->push_back(42);
    };
    std::thread t1{foo}, t2{foo};
    t1.join();
    t2.join();
    return pv->size();
}











```

<!-- .element: class="split" -->

Note: proposed for standardization in [n4033](https://wg21.link/n4033)

---

<!-- .slide: data-auto-animate -->

## single threaded lazy initialization

```cpp []
///hide
#include <memory>

struct Resource {
  void doSomething();
};

///unhide
std::unique_ptr<Resource> pResource;

void foo() {
  if(!pResource) {
    pResource.reset(new Resource);
  }
  pResource->doSomething();
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## multi-threaded lazy initialization

```cpp []
///hide
#include <memory>
#include <mutex>

struct Resource {
  void doSomething();
};

///unhide
std::unique_ptr<Resource> pResource;
std::mutex resourceMutex;

void foo() {
  {
    std::lock_guard<std::mutex> lk(resourceMutex);
    if(!pResource) {
      pResource.reset(new Resource);
    }
  }
  pResource->doSomething();
}
```

<!-- .element: data-id="code" -->

Note: causes serialization of threads using the resource

---

<!-- .slide: data-auto-animate -->

## double-checked locking pattern

```cpp []
///hide
#include <memory>
#include <mutex>

struct Resource {
  void doSomething();
};

///unhide
std::unique_ptr<Resource> pResource;
std::mutex resourceMutex;

void foo() {
  if(!pResource) {
    std::lock_guard<std::mutex> lk(resourceMutex);
    if(!pResource) {
      pResource.reset(new Resource);
    }
  }
  pResource->doSomething();
}
```

<!-- .element: data-id="code" -->

Note: there's a possibility for a race condition if the compiler reorders the code on line 11 to first set the pointer to be non-empty before completely constructing the resource.

---

<!-- .slide: data-auto-animate -->

## use `std::call_once`

```cpp [2,5-7]
///hide
#include <memory>
#include <mutex>

struct Resource {
  void doSomething();
};

///unhide
std::unique_ptr<Resource> pResource;
std::once_flag resourceFlag;

void foo() {
  std::call_once(resourceFlag, []{
    pResource.reset(new Resource);
  });
  pResource->doSomething();
}
```

<!-- .element: data-id="code" -->

Note: `std::call_once` will typically have a lower overhead than using a mutex explicitly, especially when the initialization has already been done

---

## safe static init

```cpp []
///hide
struct Resource {
  void doSomething();
};

///unhide
void foo()
{
  static Resource resource;
  resource.doSomething();
}
```

---

<!-- .slide: id="shared_lock" -->

## read write mutex (C++17)

```cpp [1,5-6,11-13,18]
///options=-std=c++17
///hide
#include <map>
#include <string>
#include <mutex>
///unhide
#include <shared_mutex>

///hide
class DnsEntry {};

///unhide
class DnsCach {
public:
  const DnsEntry* findEntry(const std::string& domain) const {
    std::shared_lock<std::shared_mutex> lk(m_entryMutex);
    const auto it = m_entries.find(domain);
    return (it == m_entries.end()) ? nullptr : &it->second;
  }

  void update_or_add_entry(const std::string& domain,
                           const DnsEntry& dns_details) {
    std::unique_lock<std::shared_mutex> lk(m_entryMutex);
    m_entries[domain] = dns_details;
  }
private:
  std::map<std::string, DnsEntry> m_entries;
  mutable std::shared_mutex m_entryMutex;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

<!-- .slide: data-auto-animate -->

## can't lock mutex multiple times

```cpp
///hide
#include <mutex>

///unhide
struct C {
  void func1() {
    std::lock_guard<std::mutex> lock{m_mutex};
    // do work
  }

  void func2() {
    std::lock_guard<std::mutex> lock{m_mutex};
    // do work
    func1();
    // do more work
  }

  std::mutex m_mutex;
};
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## use `std::recursive_mutex`

```cpp
///hide
#include <mutex>

///unhide
struct C {
  void func1() {
    std::lock_guard<std::recursive_mutex> lock{m_mutex};
    // do work
  }

  void func2() {
    std::lock_guard<std::recursive_mutex> lock{m_mutex};
    // do work
    func1();
    // do more work
  }

  std::recursive_mutex m_mutex;
};
///hide

int main() {
  C{}.func2();
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## or [better](https://quick-bench.com/q/yK3BksMuPRaQqs3sOMtyCtW5lW8)

```cpp
///hide
#include <mutex>

///unhide
struct C {
  void func1() {
    std::lock_guard<std::mutex> lock{m_mutex};
    func1_impl();
  }

  void func2() {
    std::lock_guard<std::mutex> lock{m_mutex};
    func1_impl();
  }

  void func1_impl() {}

  std::mutex m_mutex;
};
///hide

int main() {
  C{}.func2();
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-background-image="09_concurrency/synchronization.gif" -->

## synchronization

<!-- .element: class="chapter bottom" -->

Note: besides from protecting shared data, many times one thread needs to wait for data prepared by a different thread or get the result of some computation done by a thread.

---

<!-- .slide: data-auto-animate -->

## waiting for an event

```cpp []
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <iostream>

///unhide
bool flag;
std::mutex m;

void waitForFlag() {
  const auto check_flag = []{
    std::lock_guard<std::mutex> lk(m);
    return flag;
  };
  while(!check_flag());
  std::cout << "flag set\n";
}
///hide

int main() {
    std::thread t1{waitForFlag};
    std::thread t2{[]{
        std::this_thread::sleep_for(std::chrono::seconds{1});
        std::lock_guard<std::mutex> lk(m);
        flag = true;
    }};

    t2.join();
    t1.join();
}
```

<!-- .element: data-id="code" -->

Note: waist of cpu cycles and locking prevents other thread from setting flag

---

<!-- .slide: data-auto-animate -->

## waiting for an event

```cpp []
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <iostream>

///unhide
bool flag;
std::mutex m;

void waitForFlag() {
  const auto check_flag = []{
    std::lock_guard<std::mutex> lk(m);
    return flag;
  };
  while(!check_flag()) {
    using namespace std::chrono_literals;
    std::this_thread::sleep_for(100ms);
  }
  std::cout << "flag set\n";
}
///hide

int main() {
    std::thread t1{waitForFlag};
    std::thread t2{[]{
        std::this_thread::sleep_for(std::chrono::seconds{1});
        std::lock_guard<std::mutex> lk(m);
        flag = true;
    }};

    t2.join();
    t1.join();
}
```

<!-- .element: data-id="code" -->

Note: hard to get the sleep period right

---

## condition variables

```cpp [1,4|7-8|13]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <thread>
#include <iostream>
///unhide
#include <condition_variable>

std::mutex m;
std::condition_variable dataCond;

void waitForFlag() {
  std::unique_lock<std::mutex> lk(m);
  dataCond.wait(lk);
  std::cout << "flag set\n";
}

void setFlag() {
  dataCond.notify_one();
}
///hide

int main() {
    std::thread t1{waitForFlag};
    std::thread t2{setFlag};

    t2.join();
    t1.join();
}
```

Note: need to use `unique_lock`. Note that the condition variable is notified with the mutex unlocked so that, if the waiting thread wakes immediately, it doesn’t then have to block again, waiting for the notifier to unlock the mutex. 
But where is the condition?

---

## producer consumer

```cpp [2,5-14|17-32|21-23]
///hide
#include <mutex>
#include <condition_variable>
#include <queue>

struct DataChunk {};

bool moreDataToPrepare();
DataChunk prepareData();
bool isLastChunk(const DataChunk&);
void process(const DataChunk&);

///unhide
std::mutex mut;
std::queue<DataChunk> dataQueue;
std::condition_variable dataCond;

void dataPreparationThread() {
  while(moreDataToPrepare()) {
    const auto data = prepareData();
    {
      std::lock_guard<std::mutex> lk(mut);
      dataQueue.push(data);
    }
    dataCond.notify_one();
  }
}


void dataProcessingThread() {
  while(true) {
    const auto data = []{
      std::unique_lock<std::mutex> lk(mut);
      dataCond.wait(lk, []{
        return !dataQueue.empty();
      });
      const auto data = dataQueue.front();
      dataQueue.pop();
      return data;
    }();
    process(data);
    if(isLastChunk(data))
      break;
  }
}
```

<!-- .element: class="split" -->

Note: the condition var. calls checks the condition before going to sleep.
the condition variable unlocks the mutex when waiting and re-locks when it's awaken to check the condition.
There's also `notify_all` for awakening **all** threads waiting on the same condition.

---

## platform specific

```cpp [11-19]
///options=-pthread
///hide
#include <pthread.h>
#include <iostream>
#include <thread>
#include <cstring>

///unhide
void f(int num) {
  std::this_thread::sleep_for(std::chrono::seconds(1));

  sched_param sch;
  int policy;
  pthread_getschedparam(pthread_self(), &policy, &sch);
  std::cout << "Thread " << num << " is executing at priority "
            << sch.sched_priority << '\n';
}

///hide
int main() {
///unhide
std::thread t1(f, 1), t2(f, 2);

sched_param sch;
int policy;
pthread_getschedparam(t1.native_handle(), &policy, &sch);
sch.sched_priority = 20;
if (pthread_setschedparam(t1.native_handle(), SCHED_FIFO, &sch)) {
  std::cout << "Failed to setschedparam: " << std::strerror(errno) << '\n';
}
///hide

t1.join(); 
t2.join();
}
```

<!-- .element: style="font-size: 0.4em" -->

Note:: there's a similar facility for mutex types

---

<!-- .slide: data-background-image="09_concurrency/future.gif" data-background-size="contain" -->

## std::future

<!-- .element: class="chapter" -->

Note: `std::thread` doesn't return a value. Although we could send it a reference to the result and then wait there is a better alternative.

---

## `std::future`

Getting the result of an asynchronous operation

```cpp
template< class T > class future {
public:
  // returns the result
  T get();

  // is this attached to an operation result
  bool valid() const noexcept;
};
```

Note: How to obtain a future?

---

## `std::async`

runs a function asynchronously

```cpp
///hide
#include <iostream>
///unhide
#include <future>

///hide
int findTheAnswerToLifeTheUniverseAndEverything();
void doOtherStuff();

void foo() {
///unhide
std::future<int> theAnswer 
  = std::async(findTheAnswerToLifeTheUniverseAndEverything);
doOtherStuff();
std::cout 
  << "The answer is " 
  << theAnswer.get() // blocks
  << '\n';
///hide
}
```

---

## launch policy

```cpp
///hide
#include <string>
#include <future>

///unhide
struct X
{
  void foo(int,std::string const&);
  std::string bar(std::string const&);
};

std::string run() {
  X x;
  // on a separate thread, calls p->foo(42,“hello”) where p is &x
  auto f1 = std::async(std::launch::async, &X::foo, &x, 42 , "hello");

  // during f2.get(), calls x.bar("goodbye")
  auto f2 = std::async(std::launch::deferred, &X::bar , std::ref(x), "goodbye");
  return f2.get();

} // ~f1 will block
```

<!-- .element: style="font-size: 0.4em" -->

Note: without a policy, it's implementation defined

---

## be careful

```cpp
///hide
#include <future>
#include <functional>

///unhide
void runInParallel(std::function<void()> f1, 
                   std::function<void()> f2)
{
  std::async(f1); // start as though in a new thread?
  f2();           // execute in main thread
}
```

Note: it's sequential because the future returned by `async` is blocked on destruction

---

## `std::packaged_task`

An asynchronous `std::function`

```cpp [1-2,18-26|1-2,4-15]
///hide
#include <deque>
#include <mutex>
#include <future>
#include <thread>
#include <utility>

bool shutdownReceived();

///unhide
std::mutex m;
std::deque<std::packaged_task<void()>> tasks;

void guiThread() {
  while(!shutdownReceived()) {
    auto task = []{
      std::lock_guard<std::mutex> lk(m);
      if(tasks.empty())
        return std::packaged_task<void()>{};
      auto task = std::move(tasks.front());
      tasks.pop_front();
      return task;
    }();
    if (task.valid())
      task();
  }
}

template<typename Func>
std::future<void> sendTaskToGui(Func f)
{
  std::packaged_task<void()> task(std::move(f));
  std::future<void> res = task.get_future();
  std::lock_guard<std::mutex> lk(m);
  tasks.push_back(std::move(task));
  return res;
}







```

<!-- .element: class="split" -->

---

## `std::promise`

implementing a packaged task

```cpp [5-6,13,16]
///hide
#include <functional>
#include <future>

///unhide
template <typename> class my_task;

template <typename R, typename ...Args>
class my_task<R(Args...)> {
  std::function<R(Args...)> fn;
  std::promise<R> pr;
public:
  template <typename ...Ts>
  explicit my_task(Ts &&... ts) : fn(std::forward<Ts>(ts)...) { }

  template <typename ...Ts>
  void operator()(Ts &&... ts) {
    pr.set_value(fn(std::forward<Ts>(ts)...));
  }

  std::future<R> get_future() { return pr.get_future(); }
};
```

<!-- .element: style="font-size: 0.45em" -->

---

## async accumulate

```cpp [1-2|4-13|15-19|21-31|33-36]
///hide
#include <future>
#include <numeric>
#include <vector>

///unhide
template <typename Iterator, typename T, ptrdiff_t MIN_PER_THREAD = 25>
T async_accumulate(Iterator first, Iterator last, T init)
{
  const auto length = std::distance(first, last);
  if (!length)
    return init;

  const auto max_threads = (length + MIN_PER_THREAD - 1) / MIN_PER_THREAD;
  const auto hardware_threads = std::thread::hardware_concurrency();
  const auto num_threads =
      std::min<ptrdiff_t>(hardware_threads != 0 ? hardware_threads : 2,
                          max_threads);
  const auto block_size = length / num_threads;

  std::vector<std::future<T>> results;
  results.reserve(num_threads);
  const auto accumulator = [](Iterator first, Iterator last) {
    return std::accumulate(first, last, 0);
  };

  auto block_start = first;
  for (auto block_end = std::next(block_start, block_size); 
       std::distance(block_start, last) >= block_size; 
       block_start = block_end, block_end = std::next(block_start, block_size))
  {
    results.push_back(std::async(accumulator, block_start, block_end));
  };

  std::promise<T> pr;
  results.push_back(pr.get_future());
  pr.set_value(accumulator(block_start, last));

  return std::accumulate(results.begin(), results.end(), init, 
                         [](int current, std::future<T> &rhs) {
    return current + rhs.get();
  });
}
```

<!-- .element: "style="font-size: 0.4em" -->

---

## sharing the future

```cpp [1-2|4-11|13-14|18-25|27-36]
///compiler=clang600
///options=-pthread
///hide
#include <iostream>
#include <future>
#include <chrono>

int main()
{
///unhide
std::promise<void> ready_promise, t1_ready_promise, t2_ready_promise;
std::shared_future<void> ready_future(ready_promise.get_future());

auto fun =
    [](std::shared_future<void> ready_future,
       std::promise<void> ready_promise,
       std::chrono::time_point<std::chrono::high_resolution_clock>& start) {
      ready_promise.set_value();
      ready_future.wait();  // waits for the signal from main()
      return std::chrono::high_resolution_clock::now() - start;
    };

auto fut1 = t1_ready_promise.get_future();
auto fut2 = t2_ready_promise.get_future();

std::chrono::time_point<std::chrono::high_resolution_clock> start;

auto result1 = std::async(std::launch::async, fun, ready_future,
                          std::move(t1_ready_promise), std::ref(start));
auto result2 = std::async(std::launch::async, fun, ready_future,
                          std::move(t2_ready_promise), std::ref(start));

// wait for the threads to become ready
fut1.wait();
fut2.wait();

// the threads are ready, start the clock
start = std::chrono::high_resolution_clock::now();

// signal the threads to go
ready_promise.set_value();

std::cout << "Thread 1 received the signal "
          << result1.get().count() << " ms after start\n"
          << "Thread 2 received the signal "
          << result2.get().count() << " ms after start\n";
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

Note: `std::future::get` can only be called by a single thread. For multiple threads referring the same data, use `std::shared_ptr`.
Access to the same shared state from multiple threads is safe if each thread does it through its own copy of a shared_future object.

---

## alternatively

```cpp
///hide
#include <future>

///unhide
std::promise<void> ready_promise;
auto ready_future = ready_promise.get_future().share();
```

---

## duration based waits

```cpp [3-5]
///hide
#include <future>
#include <chrono>

int some_task();
void do_something_with(int);

void foo() {
///unhide
using namespace std::chrono_literals;

auto f = std::async(some_task);
if(f.wait_for(35ms) == std::future_status::ready)
  do_something_with(f.get());
///hide
}
```

---

## time point based waits

```cpp [8-15]
///hide
#include <condition_variable>
#include <mutex>
#include <chrono>

///unhide
std::condition_variable cv;
bool done;
std::mutex m;

bool wait_loop()
{
  using namespace std::chrono_literals;
  const auto timeout = std::chrono::steady_clock::now() + 500ms;
  std::unique_lock<std::mutex> lk(m);
  while(!done)
  {
    if(cv.wait_until(lk, timeout) == std::cv_status::timeout)
      break;
  }
  return done;
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## timed lock

```cpp [4,10]
///compiler=clang600
///options=-pthread
///hide
#include <mutex>
#include <future>
#include <cassert>

///unhide
using namespace std::chrono_literals;
using clk = std::chrono::steady_clock;

std::timed_mutex m;

int main() {
  m.lock();
  auto f = std::async(std::launch::async, []{
    const auto t0 = clk::now();
    assert(m.try_lock_for(300ms) == true);
    const auto t1 = clk::now();
    m.unlock();
    auto d = t1 - t0 - 250ms;
    assert(d < 50ms);
  });
  std::this_thread::sleep_for(250ms);
  m.unlock();
  f.wait();
}
```

<!-- .element: style="font-size: 0.4em" -->

---

<!-- .slide: data-background-image="09_concurrency/errors.gif" -->

## Error handling

<!-- .element: class="chapter bottom" -->

Note: It's hard to imaging but there are something errors in a program. How do we deal with them in a multithreaded code?

---

## `std::system_error`

thrown by several threading functions

```cpp
///compiler=clang600
///options=-pthread
///hide
#include <thread>
#include <iostream>

int main() {
///unhide
try {
  std::thread{}.join();
} catch (const std::system_error& ex) {
  std::cerr 
    << ex.code() 
    << ", " 
    << ex.code().message() 
    << '\n';
}
///hide
}
```

---

## `std::future_error`

thrown by futures

```cpp
///compiler=clang600
///options=-pthread
///hide
#include <future>
#include <iostream>
#include <thread>

int main() {
///unhide
try {
  auto f = std::promise<int>{}.get_future();
  f.get();
} catch (const std::future_error& ex) {
  std::cerr 
    << ex.code() 
    << ", " 
    << ex.code().message() 
    << '\n';
}
///hide
}
```

---

<!-- .slide: data-auto-animate -->

## catch exception

```cpp []
///hide
#include <cmath>
#include <iostream>
#include <stdexcept>

///unhide
double throwingSqrt(double x)
{
    if (x < 0)
    {
      throw std::out_of_range("x<0");
    }
    return sqrt(x);
}

///hide
int main() {
///unhide
try {
  auto y = throwingSqrt(-1);
} catch (const std::exception& ex) {
  std::cerr << ex.what() << '\n';
}
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## in a thread

```cpp []
///compiler=clang600
///options=-pthread
///hide
#include <cmath>
#include <iostream>
#include <stdexcept>
#include <thread>

double throwingSqrt(double x) {
  if (x < 0) {
    throw std::out_of_range("x<0");
  }
  return sqrt(x);
}

int main() {
///unhide
try {
  double result;
  std::thread t{[&result](double x) {
                  result = throwingSqrt(x);
                }, -1};
  t.join();
} catch (const std::exception& ex) {
  std::cerr << ex.what() << '\n';
}
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## transfer the exception

```cpp [3,5-9,13-15]
///compiler=clang600
///options=-pthread
///hide
#include <cmath>
#include <iostream>
#include <stdexcept>
#include <thread>

double throwingSqrt(double x) {
  if (x < 0) {
    throw std::out_of_range("x<0");
  }
  return sqrt(x);
}

int main() {
///unhide
try {
  double result;
  std::exception_ptr ptr;
  std::thread t{[&result, &ptr](double x) {
                  try {
                    result = throwingSqrt(x);
                  } catch (...) {
                    ptr = std::current_exception();
                  }
                }, -1};
  t.join();
  if (ptr) {
    std::rethrow_exception(ptr);
  }
} catch (const std::exception& ex) {
  std::cerr << ex.what() << '\n';
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## use `promise`

```cpp [2-3,5-9,12]
///compiler=clang600
///options=-pthread
///hide
#include <cmath>
#include <iostream>
#include <stdexcept>
#include <thread>
#include <future>

double throwingSqrt(double x) {
  if (x < 0) {
    throw std::out_of_range("x<0");
  }
  return sqrt(x);
}

int main() {
///unhide
try {
  std::promise<double> p;
  auto f = p.get_future();
  std::thread t{[&p](double x) {
                  try {
                    p.set_value(throwingSqrt(x));
                  } catch (...) {
                    p.set_exception(std::current_exception());
                  }
                }, -1};
  t.join();
  double y = f.get();
} catch (const std::exception& ex) {
  std::cerr << ex.what() << '\n';
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## use `async`

```cpp [2]
///compiler=clang600
///options=-pthread
///hide
#include <cmath>
#include <iostream>
#include <stdexcept>
#include <future>

double throwingSqrt(double x) {
  if (x < 0) {
    throw std::out_of_range("x<0");
  }
  return sqrt(x);
}

int main() {
///unhide
try {
  double y = std::async(throwingSqrt, -1).get();
} catch (const std::exception& ex) {
  std::cerr << ex.what() << '\n';
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: id="atomic" data-background-image="09_concurrency/atomic.gif" -->

## `std::atomic` and memory ordering

<!-- .element: class="chapter" style="display:inherit" -->

<div class="footnote">

Source: Fedor Pikus, [C++ atomics, from basic to advanced. What do they really do?](https://www.youtube.com/watch?v=ZQFzMfHIxng)

</div>

Note: all the synchronization and data sharing protection tools we've covered couldn't work without a well defined memory model. 
C++11 contains a well defined memory model along with low level synchronization constructs called 'atomics'.

---

## atomic operation

indivisible - can’t be observed half-done from any thread in the system.

---

## atomic type

all **single** operations on are atomic

---

## `std::atomic`

```cpp
template< class T >
struct atomic;
```

`T` must be *trivially copyable* 

Note: can be `memcpy`-ed.

---

## allowed operations

```cpp []
///hide
#include <cassert>
///unhide
#include <atomic>

struct Pair{int first; int second;};
std::atomic<Pair> x;

int main() {
  x.store(Pair{42, 43});
  assert(x.exchange(Pair{45, 45}).first == 42);
  assert(x.load().second == 45);
}
```

---

<!-- .slide: data-auto-animate -->

## pointer types

adds addition & subtraction

```cpp []
///hide
#include <cassert>
///unhide
#include <atomic>

int arr[42] = {0};
std::atomic<int*> x{arr};

int main() {
  assert(x.fetch_add(2) == arr);
  assert(x.fetch_sub(1) == &arr[2]);
  assert(x.load() == &arr[1]);
}
```

<!-- .element: data-id="pointer" -->

---

<!-- .slide: data-auto-animate -->

## pointer types

alternatively

```cpp []
///hide
#include <cassert>
///unhide
#include <atomic>

int arr[42] = {0};
std::atomic<int*> x{arr};

int main() {
  assert((x += 2) == &arr[2]);
  assert(--x == &arr[1]);
}
```

<!-- .element: data-id="pointer" -->

---

<!-- .slide: data-auto-animate -->

## integral types

adds bitwise operations

```cpp []
///hide
#include <cassert>
///unhide
#include <atomic>

std::atomic<uint32_t> x{0xFFF};

int main() {
  assert(x.fetch_and(0xF0F) == 0xFFF);
  assert(x.fetch_or(0x070) == 0xF0F);
  assert(x.fetch_xor(0xFFF) == 0xF7F);
  assert(x.load() == 0x080);
}
```

<!-- .element: data-id="integral" -->

---

<!-- .slide: data-auto-animate -->

## integral types

adds bitwise operations

```cpp []
///hide
#include <cassert>
///unhide
#include <atomic>

std::atomic<uint32_t> x{0xFFF};

int main() {
  assert((x &= 0xF0F) == 0xF0F);
  assert((x |= 0x070) == 0xF7F);
  assert((x ^= 0xFFF) == 0x080);
}
```

<!-- .element: data-id="integral" -->

---

## only single operations

```cpp
///hide
#include <atomic>

///unhide
std::atomic<int> x;

///hide
int main() {
///unhide
x = x + 2; // not atomic
///hide
}
```

---

## might be emulated

```cpp
///options=-latomic
///hide
#include <atomic>
#include <cassert>

int main() {
///unhide
assert(std::atomic<int>{}.is_lock_free());

struct S{int arr[4];};
assert(not std::atomic<S>{}.is_lock_free());
///hide
}
```

---

<!-- .slide: id="is_always_lock_free" -->

## compile time check (C++17)

```cpp
///options=-std=c++17
///hide
#include <atomic>

///unhide
static_assert(std::atomic<bool>::is_always_lock_free);
```

---

## Compare-and-swap (CAS)

used in most lock-free algorithms

```cpp
///hide
#include <atomic>

///unhide
std::atomic<int> x{0};

void atomic_multiply(int y) {
  int x0 = x;
  while ( !x.compare_exchange_strong(x0, x0 * y) );
}
```

---

## Pseudo code

<!-- .slide: data-auto-animate -->

```cpp [2-3|4|5-6|7-8]
///hide
struct Lock{};

template<typename T>
struct atomic {
T value;
///unhide
bool compare_exchange_strong(T& old_v, T new_v) {
  T tmp = value; // Current value of the atomic
  if (tmp != old_v) { old_v = tmp; return false; }
  Lock l; // Get exclusive access
  tmp = value; // value could have changed!
  if (tmp != old_v) { old_v = tmp; return false; }
  value = new_v;
  return true;
}
///hide
};
```

<!-- .element: data-id="cas" -->

Note: double-checked locking pattern. Lock is not a real mutex but some form of exclusive access implemented in hardware

---

## Pseudo code - weak

<!-- .slide: data-auto-animate -->

```cpp [1,4-5]
///hide
struct TimedLock{
  bool locked();
};

template<typename T>
struct atomic {
T value;
///unhide
bool compare_exchange_weak(T& old_v, T new_v) {
  T tmp = value; // Current value of the atomic
  if (tmp != old_v) { old_v = tmp; return false; }
  TimedLock tl; // Get exclusive access
  if (!tl.locked()) return false; // old_v is correct
  tmp = value; // value could have changed!
  if (tmp != old_v) { old_v = tmp; return false; }
  value = new_v;
  return true;
}
///hide
};
```

<!-- .element: data-id="cas" -->

---

## reading and writing

```cpp []
///hide
#include <vector>
#include <atomic>
#include <iostream>
#include <thread>

///unhide
std::vector<int> data;
std::atomic<bool> ready(false);

void writer() {
  data.push_back(42);
  ready.store(true);
}

void reader() {
  while (not ready.load()) {
      std::this_thread::sleep_for(std::chrono::milliseconds(1));
  }
  std::cout << "The answer is " << data.back() << '\n';
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: 
- Atomics are used to get exclusive access to memory or to
reveal memory to other threads
- What guarantees that other threads see this memory in
the desired state

---

## memory barriers

- How changes to memory made by one thread become visible to other threads
- modeled by `std::memory_order` enum

---

### `std::memory_order_relaxed`

- no synchronization or ordering constraints imposed on **other** reads or writes.
- operations before atomic operation can be observed after it and vice versa

---

## counter

```cpp
///hide
#include <atomic>
#include <cstddef>

///unhide
class S{
  static std::atomic<size_t> instanceCount;

  S() {
    instanceCount.fetch_add(1, std::memory_order_relaxed);
  }

  ~S() {
    instanceCount.fetch_sub(1, std::memory_order_relaxed);
  }
};
```

---

### `std::memory_order_acquire`

- all memory operations scheduled after the barrier in the program order become visible after the barrier
- reads and writes, in the thread doing the atomic operation, cannot be reordered from after to before the barrier

---

### `std::memory_order_release`

- all memory operations scheduled before the barrier in the program order become visible before the barrier
- reads and writes, in the thread doing the atomic operation cannot be reordered from before to after the barrier

---

## `std::atomic_flag`

```cpp
///hide
#include <atomic>

///unhide
class spinlock_mutex {
    std::atomic_flag flag;
public:
    spinlock_mutex(): flag{ATOMIC_FLAG_INIT}
    {}

    void lock() {
      while(flag.test_and_set(std::memory_order_acquire));
    }

    void unlock() {
      flag.clear(std::memory_order_release);
    }
};
```

---

## Release-Acquire ordering

```cpp []
///hide
#include <vector>
#include <atomic>
#include <iostream>
#include <thread>

///unhide
std::vector<int> data;
std::atomic<bool> ready(false);

void writer() {
  data.push_back(42);
  ready.store(true, std::memory_order_release);
}

void reader() {
  while (not ready.load(std::memory_order_acquire)) {
      std::this_thread::sleep_for(std::chrono::milliseconds(1));
  }
  std::cout << "The answer is " << data.back() << '\n';
}
```

<!-- .element: style="font-size: 0.45em" -->

---

### `std::memory_order_acq_rel`

- no operation can move across the barrier
- but only if both threads use the same atomic variable

---

<!-- .slide: data-auto-animate -->

## read modify write

```cpp []
///hide
#include <vector>
#include <atomic>
#include <cassert>

///unhide
std::vector<int> data;
std::atomic<int> flag{0};

void writer() {
  data.push_back(42);
  flag.store(1, std::memory_order_release);
}

void middleMan() {
  int expected = 1;
  while (!flag.compare_exchange_strong(expected, 2, 
                                       std::memory_order_acq_rel));
}

void reader() {
  while (flag.load(std::memory_order_acquire) < 2) ;
  assert(data.back() == 42);
}
```

<!-- .element: data-id="cas" style="font-size: 0.42em" -->

---

<!-- .slide: data-auto-animate -->


## read modify write

```cpp []
///hide
#include <vector>
#include <atomic>
#include <cassert>

///unhide
std::vector<int> data;
std::atomic<int> flag{0};

void writer() {
  data.push_back(42);
  flag.store(1, std::memory_order_release);
}

void middleMan() {
  int expected = 1;
  while (!flag.compare_exchange_strong(expected, 2, 
                                       std::memory_order_acq_rel,
                                       std::memory_order_relaxed));
}

void reader() {
  while (flag.load(std::memory_order_acquire) < 2) ;
  assert(data.back() == 42);
}
```

<!-- .element: data-id="cas" style="font-size: 0.42em" -->

---

### `std::memory_order_seq_cst`

- sequential consistency
- single total modification order of all atomics
- the default order
- makes your programs slow

---

## a simple thread pool

```cpp [2-4|6-15|18-27|29|31-39]
///hide
#include <algorithm>
#include <functional>
#include <future>
#include <vector>

template <typename T>
struct thread_safe_queue {
  template <typename U = T>
  void push(U&&);
  bool try_pop(T&);
};

class thread_joiner {
 public:
  explicit thread_joiner(std::thread thread) : m_thread{std::move(thread)} {}
  ~thread_joiner() {
    if (m_thread.joinable()) {
      m_thread.join();
    }
  }
  thread_joiner(const thread_joiner&) = delete;
  thread_joiner(thread_joiner&&) = default;
  thread_joiner& operator=(const thread_joiner&) = delete;
  thread_joiner& operator=(thread_joiner&&) = default;

 private:
  std::thread m_thread;
};

///unhide
class thread_pool {
  thread_safe_queue<std::function<void()>> work_queue;
  std::atomic<bool> done{false};
  std::vector<thread_joiner> threads;

  void worker_thread() {
    while (!done) {
      std::function<void()> task;
      if (work_queue.try_pop(task)) {
        task();
      } else {
        std::this_thread::yield();
      }
    }
  }

 public:
  thread_pool() {
    const auto thread_count = std::thread::hardware_concurrency();
    threads.reserve(thread_count);
    std::generate_n(std::back_inserter(threads), 
                    thread_count, 
                    [this] {
      return thread_joiner{std::thread{&thread_pool::worker_thread, 
                                       this}};
    });
  }

  ~thread_pool() { done = true; }

  template <typename FunctionType>
  std::future<typename std::result_of<FunctionType()>::type> submit(
      FunctionType f) {
    using result_type = typename std::result_of<FunctionType()>::type;
    std::packaged_task<result_type()> task(std::move(f));
    const auto res = task.get_future();
    work_queue.push([task] { task(); });
    return res;
  }
};
```

<!-- .element: style="font-size: 0.45em" -->

Note: there's a lot of contention on the queue. to avoid that we'll add a separate work queue for each thread

---

<!-- .slide: id="thread_local" -->

## `thread_local`

```cpp [2-5|9-25|47-52]
///hide
#include <algorithm>
#include <functional>
#include <future>
#include <vector>
#include <queue>

template <typename T>
struct thread_safe_queue {
  template <typename U = T>
  void push(U&&);
  bool try_pop(T&);
};

class thread_joiner {
 public:
  explicit thread_joiner(std::thread thread) : m_thread{std::move(thread)} {}
  ~thread_joiner() {
    if (m_thread.joinable()) {
      m_thread.join();
    }
  }
  thread_joiner(const thread_joiner&) = delete;
  thread_joiner(thread_joiner&&) = default;
  thread_joiner& operator=(const thread_joiner&) = delete;
  thread_joiner& operator=(thread_joiner&&) = default;

 private:
  std::thread m_thread;
};

///unhide
class thread_pool {
  thread_safe_queue<std::function<void()>> pool_work_queue;
  using local_queue = std::queue<std::function<void()>>;
  static thread_local std::unique_ptr<local_queue> 
    local_work_queue;
  std::atomic<bool> done{false};
  std::vector<thread_joiner> threads;

  void worker_thread() {
    local_work_queue = std::make_unique<local_queue>();

    while (!done) {
      std::function<void()> task;
      if (not local_work_queue->empty()) {
        task = std::move(local_work_queue->front());
        local_work_queue->pop();
        task();
      }
      else if (pool_work_queue.try_pop(task))  {
        task();
      } else {
        std::this_thread::yield();
      }
    }
  }

 public:
  thread_pool() {
    const auto thread_count = std::thread::hardware_concurrency();
    threads.reserve(thread_count);
    std::generate_n(std::back_inserter(threads), 
                    thread_count, 
                    [this] {
      return thread_joiner{std::thread{&thread_pool::worker_thread, 
                                       this}};
    });
  }

  ~thread_pool() { done = true; }

  template <typename FunctionType>
  std::future<typename std::result_of<FunctionType()>::type> submit(
      FunctionType f) {
    using result_type = typename std::result_of<FunctionType()>::type;
    std::packaged_task<result_type()> task(std::move(f));
    const auto res = task.get_future();
    const auto work = [task] { task(); };
    if (local_work_queue) {
      local_work_queue->push(work);
    } else {
      pool_work_queue.push(work);
    }
    return res;
  }
};
```

<!-- .element: style="font-size: 0.45em" -->


---

<!-- .slide: data-background-image="09_concurrency/thanks.gif" -->