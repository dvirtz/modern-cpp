<!-- .slide: data-background-image="05_lambda/ferdinand.jpg" -->

---

## count odds

> Given a vector of integers, count the number of odd items.

```cpp
///hide
#include <vector>

///unhide
int count_odds(const std::vector<int>& v);
```

<!-- .element: class="fragment" -->

---

## First try

```cpp
///hide
#include <vector>

///unhide
int count_odds(const std::vector<int>& v)
{
    int ret = 0;
    for (auto it = v.begin(); 
         it != v.end(); 
         ++it)
    {
        if ((*it & 1) == 1)
            ++ret;
    }
    
    return ret;
}
```

---

<!-- .slide: data-background="05_lambda/wheel.gif" data-background-size="contain" -->

Don't reinvent the wheel

---

<!-- .slide: data-auto-animate -->

## `#include <algorithm>`

```cpp
///hide
#include <iterator>

///unhide
template<class InputIterator, class Predicate>
typename std::iterator_traits<InputIterator>::difference_type
count_if(InputIterator first, InputIterator last, Predicate pred);
```

<!-- .element: style="font-size: 0.5em" -->

> Returns the number of iterators it in the range `[first, last)` for which the following condition hold: 
> `pred(*it) != false`

---

<!-- .slide: data-auto-animate -->

## `#include <algorithm>`

```cpp
///hide
#include <iterator>

///unhide
template<class InputIterator, class Predicate>
typename std::iterator_traits<InputIterator>::difference_type
count_if(InputIterator first, InputIterator last, Predicate pred);
```

<!-- .element: style="font-size: 0.5em" -->

In our case `pred` should have the following signature:

```cpp
bool pred(int i);
```

---

<!-- .slide: data-auto-animate -->

## Write a function

```cpp []
///hide
#include <vector>
#include <algorithm>

///unhide
bool isOdd(int i)
{
    return (i & 1) == 1;
}

int count_odds(const std::vector<int>& v)
{
    return std::count_if(v.begin(), v.end(), isOdd);
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## Write a function object

```cpp []
///hide
#include <vector>
#include <algorithm>

///unhide
struct IsOdd
{
    bool operator()(int i)
    {
        return (i & 1) == 1;
    }
};

int count_odds(const std::vector<int>& v)
{
    return std::count_if(v.begin(), v.end(), IsOdd());
}
```

<!-- .element: data-id="code" -->

---

## So, what’s the problem?

Creating functions or functors can be a lot of effort, especially if the function/functor is only used in one specific place. 

These functions and functors also unnecessarily ‘clutter up’ the code.

---

<!-- .slide: data-background-image="05_lambda/sirtaki.gif" -->

# Lambda expressions

<!-- .element: class="r-stretch" style="display: flex; align-items: flex-end; text-shadow: 3px 3px black; color: lightblue" -->

---

## Do it `λ`-style!

```cpp
///hide
#include <vector>
#include <algorithm>

///unhide
int count_odds(const std::vector<int>& v)
{
    return std::count_if(v.begin(), v.end(), [](int i)->bool
    {
        return (i & 1) == 1;
    });
}
```

---

## Syntax

<div class="r-stack r-stretch">

<div class="fragment highlight top" style="background-color:#1b91ff3d; height:5em; width:5em; top: -3em; left: -16em">
introducer
</div>

<div class="fragment highlight top" style="background-color:#42affa40; height:5em; width:7em; top: -3em; left: -8em">
(optional) parameter list
</div>

<div class="fragment highlight top" style="background-color:#8dcffc57; height:5em; width:7em; top: -3em; left: 2em">
(optional) return type
</div>

<div class="fragment highlight bottom" style="background-color:#bee4fd52; height:5em; width:24em; top: 3em; left: -6.6em">
body
</div>

```cpp
///hide
void foo() {
///unhide
[]          (int i)          ->bool

{ return (i & 1) == 1; }
///hide
;
}
```

<!-- .element: style="height: auto" -->

</div>

---

## behind the scenes

```cpp
///hide
void foo() {
///unhide
[](int i)->bool
{
    return (i & 1) == 1;
}
///hide
;
}
```

is translated to

```cpp [|4]
class __compiler_generated_name__
{
public: 
    inline bool operator()(int i) const
    {
      return (i & 1) == 1;
    }
};
```

---

## Named lambda

```cpp [2-5|7,9]
///hide
#include <vector>
#include <algorithm>
#include <cassert>

///unhide
void remove_odds(std::vector<int> &v) {
    auto isOdd = [](int i)
    {
        return (i & 1) == 1;
    };

    v.erase(std::remove_if(v.begin(), v.end(), isOdd), v.end());

    assert(std::count_if(v.begin(), v.end(), isOdd) == 0);
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## increment vector

> Given an integer and a vector, add the integer to every element of the vector.

```cpp
///hide
#include <vector>

///unhide
void add_to_vector(std::vector<int>& v, int added);
```

<!-- .element: class="fragment" -->

---

<!-- .slide: data-auto-animate -->

## `std::for_each`

```cpp
template<class InputIterator, class Function>
Function for_each(InputIterator first, InputIterator last, Function fn);
```

<!-- .element: style="font-size: 0.45em" -->

> Applies function `fn` to each of the elements in the range `[first,last)`.

---

<!-- .slide: data-auto-animate -->

## `std::for_each`

```cpp
template<class InputIterator, class Function>
Function for_each(InputIterator first, InputIterator last, Function fn);
```

<!-- .element: style="font-size: 0.45em" -->

In our case `fn` should have the following signature:

```cpp
void fn(int& i);
```

---

## First try

```cpp
///fails='added' is not captured
///hide
#include <vector>
#include <algorithm>

///unhide
void add_to_vector_wrong(std::vector<int>& v, int added)
{
    std::for_each(v.begin(), v.end(), [](int& i)
    {
        i += added;
    });
}
```

---

## Using a function object

```cpp
///hide
#include <vector>
#include <algorithm>

///unhide
struct Add
{
    int m_added;
    Add(int added) : m_added(added) {}
    void operator()(int& i)
    {
        i += m_added;
    }
};

void add_to_vector_struct(std::vector<int>& v, int added)
{
    std::for_each(v.begin(), v.end(), Add(added));
}
```

---

## Capture that

```cpp
///hide
#include <vector>
#include <algorithm>

///unhide
void addToVector(std::vector<int>& v, int added)
{
    std::for_each(v.begin(), v.end(), [added](int& i)
    {
        i += added;
    });
}
```

---

<!-- .slide: class="aside" -->

### new number -> string conversions

```cpp [2-7,10-11|8-9]
#include <string>

struct Employee {
    int id;
    double salary;

    std::string to_string() const {
        return std::string{"Employee ID: "} + std::to_string(id) 
            + ", Salary: " + std::to_string(salary);
    }
};
```

<!-- .element: style="font-size: 0.45em" -->

- <!-- .element: class="fragment" style="font-size: 0.7em" --> no base support
- <!-- .element: class="fragment" style="font-size: 0.7em" --> return value may differ from what std::cout prints by default
- <!-- .element: class="fragment" style="font-size: 0.7em" --> relies on the current locale for formatting purposes

---

<!-- .slide: class="aside" -->

### new string -> number conversions

```cpp [11-15]
#include <string>

struct Employee {
    int id;
    double salary;

    Employee(const std::string& str) {
        const auto next_numeric = [](const std::string& s) {
            return s.substr(s.find_first_of("0123456789"));
        };
        const auto id_start = next_numeric(str);
        auto id_end = size_t{};
        id = std::stoi(id_start, &id_end, 10);
        const auto salary_start = next_numeric(id_start.substr(id_end));
        salary = std::stod(salary_start);
    }
};
```

<!-- .element: style="font-size: 0.45em" -->

-  <!-- .element: class="fragment" style="font-size: 0.7em" --> throws if conversion failed
-  <!-- .element: class="fragment" style="font-size: 0.7em" --> relies on the current locale for formatting purposes


---

## By reference

```cpp
///hide
#include <vector>
#include <algorithm>
#include <string>

///unhide
std::string to_string(const std::vector<int>& v)
{
    std::string s;
    std::for_each(v.begin(), v.end(), [&s](int i)
    {
        s += std::to_string(i) + " ";
    });
    return s;
}
```

---

## Capturing members

```cpp [|3,10-12]
///hide
#include <algorithm>

///unhide
struct ContainerIncrementer
{
    int m_x;
    ContainerIncrementer(int x) : m_x(x) {}
    template<typename Container>
    void increment(Container& cont)
    {
        std::for_each(std::begin(cont), 
                      std::end(cont), 
                      [this](int& val) {
                        val += m_x;
                      }
        );
    }
};
```

<!-- .element: style="font-size: 0.5em" -->

---

## Default captures

|||
|-|-|
| `[&]` | Capture any referenced variable by reference |
| `[=]` | Capture any referenced variable by making a copy |
| `[=, &foo]` | Capture any referenced variable by making a copy, but capture variable foo by reference |

---

## fill vector

> fill a given vector with the numbers 0,1,2,...

---

## `#include <numeric>`

```
template< class ForwardIt, class T >
void iota( ForwardIt first, ForwardIt last, T value );
```

> Fills the range `[first, last)` with sequentially increasing values, starting with `value`.

---

## fill vector

```cpp [5]
#include <numeric>
#include <vector>

void fill_vector(std::vector<int>& v) {
    std::iota(v.begin(), v.end(), 0);
}
```

---

## fill vector

> fill a given vector with the numbers 0,2,4,...

---


## `#include <algorithm>`

```
template< class ForwardIt, class Generator >
void generate( ForwardIt first, ForwardIt last, Generator g );
```

<!-- .element: style="font-size: 0.5em" -->

> Assigns each element in range `[first, last)` a value generated by the given function object `g`.

---

<!-- .slide: data-auto-animate -->

## fill vector

```cpp [5-10]
///fails=assignment of read-only variable 'i'
#include <algorithm>
#include <vector>

void fill_vector(std::vector<int>& v) {
    int i = 0;
    std::generate(v.begin(), v.end(), [i]{
        const auto next = i;
        i += 2;
        return next;
    });
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## fill vector

```cpp [8]
///fails=assignment of read-only variable 'i'
#include <algorithm>
#include <vector>

void fill_vector(std::vector<int>& v) {
    int i = 0;
    std::generate(v.begin(), v.end(), [i]{
        const auto next = i;
        i += 2; // error: assignment of read-only variable 'i'
        return next;
    });
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## mutable lambda

```cpp [6]
#include <algorithm>
#include <vector>

void fill_vector(std::vector<int>& v) {
    int i = 0;
    std::generate(v.begin(), v.end(), [i]() mutable {
        const auto next = i;
        i += 2;
        return next;
    });
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## capture init (C++14)

```cpp [5]
#include <algorithm>
#include <vector>

void fill_vector(std::vector<int>& v) {
    std::generate(v.begin(), v.end(), [i = 0]() mutable {
        const auto next = i;
        i += 2;
        return next;
    });
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Higher order lambda

```cpp
///hide
#include <iostream>
#include <string>

///unhide
auto add_prefix(const std::string &prefix) {
    return [&prefix](const std::string s) {
        return prefix + s;
    };
}

///hide
int main() {
///unhide
std::cout << add_prefix("Hello ")("World") << '\n';
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## careful

```cpp
///compiler=clang600
///hide
#include <iostream>
#include <string>

///unhide
auto add_prefix(const std::string &prefix) {
    return [&prefix](const std::string s) {
        return prefix + s;
    };
}

///hide
int main() {
///unhide
const auto prefixer = add_prefix("Hello ");
std::cout << prefixer("World") << '\n';
///hide
}
```

<!-- .element: data-id="code" -->

---

## C++ Core Guidelines [F.53](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rf-value-capture)

> Avoid capturing by reference in lambdas that will be used non-locally, including returned, stored on the heap, or passed to another thread

---

## C++ Core Guidelines [Con.1](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rconst-immutable)

> By default, make objects immutable

---

<!-- .slide: data-auto-animate -->

## it's complicated

```cpp []
///hide
#include <iostream>
#include <string>

///unhide
void draw_upper_case() {
    std::string s;
    for (char c; std::cin >> c; ) {
        s += toupper(c);
    }

    // draw text
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## it's complicated

```cpp [2-8]
///hide
#include <iostream>
#include <string>

///unhide
void draw_upper_case() {
    const auto s = [&] {
        std::string s;
        for (char c; std::cin >> c; ) {
            s += toupper(c);
        }
        return s;
    }();

    // draw text
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## `#include <algorithm>`

```cpp [4-7]
///hide
#include <iostream>
#include <string>
#include <algorithm>
#include <iterator>

///unhide
void draw_upper_case() {
    const auto s = [&] {
        std::string s;
        std::transform(std::istream_iterator<char>{std::cin}, 
                       std::istream_iterator<char>{},
                       std::back_inserter(s),
                       toupper);
        return s;
    }();

    // draw text
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

## C++ Core Guidelines [ES.28](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#es28-use-lambdas-for-complex-initialization-especially-of-const-variables)

> Use lambdas for complex initialization, especially of `const` variables

---

<!-- .slide: data-background-image="05_lambda/sculptures.webp" data-background-position="top" -->

# legacy code
<!-- .element: class="r-stretch" style="display: flex; align-items: flex-end; justify-content: center; text-shadow: 3px 3px black; color: lightblue" -->

---

<!-- .slide: data-auto-animate -->

Many libraries have such an interface

```cpp []
typedef int(*callback)(char*, int);
void register_callback(callback cb);
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

How can we call this with a lambda?

---

<!-- .slide: data-auto-animate -->

A captureless lambda can be converted to a function pointer

```cpp []
///hide
int read_count = 42;

///unhide
typedef int(*callback)(char*, int);
void register_callback(callback cb);

///hide
void register_callback(callback cb) { cb(nullptr, 0); }

int main(){
///unhide
register_callback([](char* buffer, int size) {
    /// read into buffer
    return read_count;
});
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

For capturing lambda we can add a level of indirection if the library supports user data

```cpp [1-2|4-8|9-11]
///hide
#include <fstream>
int read_count = 42;

///unhide
typedef int(*callback)(const char*, int, void*);
void register_callback(callback cb, void* userdata);

///hide
void register_callback(callback cb, void* userdata) { cb(nullptr, 0, userdata); }

int main(){
///unhide
std::fstream f;
auto cb = [&f](const char* buffer, int size) {
    /// read from f into buffer
    return read_count;
};
register_callback([](const char* buffer, int size, void* userdata){
    return (*static_cast<decltype(cb)*>(userdata))(buffer, size);
}, &cb);
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

Note: need to keep `cb` alive while the callback is active

---

## Let's benchmark

[Benchmark 1](https://quick-bench.com/q/lGVLy95a_GURGh2BJAuC9qKwFS4)

[Benchmark 2](https://quick-bench.com/q/19wvZEycM8eMDSXe5PVn4TUwstw)

---

## Generic Lambda (C++14)

```cpp
///hide
void foo() {
///unhide
[](const auto& a, auto& b){
    b += a;
}
///hide
;
}
```

is translated to

```cpp [4-5]
class __compiler_generated_name__
{
public: 
    template<typename A, typename B>
    inline void operator()(const A& a, B& b) const
    {
      return b += a;
    }
};
```

---

## Templated Lambda (C++20)

e.g. to force the same type

```cpp
///hide
void foo() {
///unhide
[]<typename T>(const T& a, T& b){
    b += a;
}
///hide
;
}
```

---

<!-- .slide: data-auto-animate -->

## Storing lambda

```cpp []
///hide
template<typename Lambda>
///unhide
class CallbackHolder {
public:
    CallbackHolder(Lambda callback) 
        : m_callback{callback} 
    {}

    void call() {
        m_callback();
    }

    Lambda m_callback;
};
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Storing lambda

templatize

```cpp []
///hide
#include <utility>

///unhide
template<typename Lambda>
class CallbackHolder {
public:
    CallbackHolder(Lambda callback) 
        : m_callback{callback} 
    {}

    void call() {
        m_callback();
    }

    Lambda m_callback;
};

template<typename Lambda>
CallbackHolder<Lambda> make_holder(Lambda&& lambda) {
    return { std::forward<Lambda>(lambda) };
}

///hide
int main() {
///unhide
auto holder = make_holder([](){ return 42; });
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Storing lambda

`std::function`

```cpp []
#include <functional>

class CallbackHolder {
public:
    CallbackHolder(std::function<void()> callback) 
        : m_callback{callback} 
    {}

    void call() {
        m_callback();
    }

    std::function<void()> m_callback;
};

///hide
int main() {
///unhide
CallbackHolder holder{[](){ return 42; }};
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

## `std::function`

A general-purpose polymorphic function wrapper. 

```cpp
///hide
template<typename... Ts> class function;

///unhide
template< class R, typename... Args >
class function<R(Args...)>;
```

Can store any `Callable` which recieves `Args` and returns `R`.

---

<!-- .slide: data-auto-animate -->

## Examples

Free function

```cpp []
///hide
#include <functional>

///unhide
long floor(double d) { return d; }

int main(){
    std::function<long(double)> f = floor;
    return f(4.2);
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Examples

Lambda

```cpp []
///hide
#include <functional>

///unhide
auto floor = [](double d)->int { return d; };

int main(){
    std::function<long(double)> f = floor;
    return f(4.2);
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Examples

Function abject

```cpp []
///hide
#include <functional>

///unhide
struct floor{
    long operator()(double d) { return d; }
};

int main(){
    std::function<long(double)> f = floor{};
    return f(4.2);
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Examples

Member function

```cpp []
///hide
#include <functional>

///unhide
struct floor{
    floor(double d) : m_d{d} {}
    long calc() const { return m_d; }
    double m_d;
};

int main(){
    std::function<long(const floor&)> f = &floor::calc;
    return f(floor{4.2});
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## Examples

Member variable

```cpp []
///hide
#include <functional>

///unhide
struct floor{
    floor(double d) : m_d{d} {}
    long calc() const { return m_d; }
    double m_d;
};

int main(){
    std::function<double(const floor&)> f = &floor::m_d;
    return f(floor{4.2});
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## virtual function

```cpp []
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get() const { return 1; }
};

struct Derived : Base {
    virtual int get() const { return 2; }
};

///hide
int main() {
///unhide
Base* p = new Derived();
assert(p->get() == 2);
///hide
}
```

<!-- .element: data-id="override" -->

---

## changing signature

<!-- .slide: class="aside" data-auto-animate -->

```cpp [3,7,11]
///fails=Assertion `p->get(0) == 2' failed
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get(int i) const { return i + 1; }
};

struct Derived : Base {
    virtual int get() const { return 2; }
};

///hide
int main() {
///unhide
Base* p = new Derived();
assert(p->get(0) == 2);
///hide
}
```

<!-- .element: data-id="override" -->

---

## proper compiler error

<!-- .slide: class="aside" data-auto-animate -->

```cpp [7]
///fails='int Derived::get() const' marked 'override', but does not override
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get(int i) const { return i + 1; }
};

struct Derived : Base {
    int get() const override { return 2; } // error
};

///hide
int main() {
///unhide
Base* p = new Derived();
assert(p->get(0) == 2);
///hide
}
```

<!-- .element: data-id="override" -->

---

## disable override

<!-- .slide: class="aside" data-auto-animate -->

```cpp [7,11]
///fails=virtual function 'virtual int Grandson::get(int) const' overriding final function
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get(int i) const { return i + 1; }
};

struct Derived : Base {
    int get(int) const final { return 2; }
};

struct Grandson : Derived {
    int get(int) const override { return 3; } // error
}
```

<!-- .element: data-id="override" -->

---

<!-- .slide: class="aside" -->

## C++ Core Guidelines [C.128](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c128-virtual-functions-should-specify-exactly-one-of-virtual-override-or-final)

> Virtual functions should specify exactly one of `virtual`, `override`, or `final`

---

## final class

<!-- .slide: class="aside" -->

```cpp [6,10]
///fails=cannot derive from 'final' base 'Derived' in derived type 'Grandson'
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get(int i) const { return i + 1; }
};

struct Derived final : Base {
    int get(int) const { return 2; }
};

struct Grandson : Derived { // error
}
```

---

## devirtualization

<!-- .slide: class="aside" -->

```cpp [10-12]
///hide
#include <cassert>

///unhide
struct Base {
    virtual ~Base() = default;
    virtual int get(int i) const { return i + 1; }
};

struct Derived final : Base {
    int get(int) const { return 2; }
};

int callGet(const Derived& d, int i) { 
  return d.get(i); 
}
```

---

## `std::function` Ceveats

* might allocate
* may require two calls through function pointers per invocation

[Benchmark 1](https://quick-bench.com/q/DfBQBz4PrwOceIQZIGbodXAXLz8)

[Benchmark 2](https://quick-bench.com/q/1P8T7rMTwrNIR-021rDiHwaJsnY)

---

## Lambdas

1. make code more readable
2. improve locality of the code
3. allow to store state easily
4. make using algorithms easy
5. get better with each revision

<div class="r-stretch footnote">

Source: [Bartek's coding blog](https://www.bfilipek.com/2020/05/lambdasadvantages.html?m=1#5-lambdas-get-better-with-each-revision-of-c)

</div>

---

<!-- .slide: data-background-image="05_lambda/ευχαριστώ.jpg" data-background-size="contain" -->