<!-- .slide: data-background-image="06_smart_pointers/pallister.png" data-background-size="contain" -->

---

## what's printed

```cpp
///hide
#include <string>
#include <iostream>
#include <stdexcept>

///unhide
void process(const std::string& str) {
    auto p = new int;
    *p = std::stoi(str);
    std::cout << *p << '\n';
    delete p;
}

///hide
int main() {
///unhide
try {
    process("ll");
} catch (std::exception& ex) {
    std::cout << ex.what() << '\n';
}
///hide
}
```

---

## what's wrong here

```cpp
///options=-fsanitize=address
///fails=attempting double-free
///hide
#include <string>
#include <iostream>
#include <stdexcept>

///unhide
struct S{
    S(): p{new int} {}
    ~S() { delete p; }
    S(const S& other) : p{other.p} {}

    int* p;
};

///hide
int main() {
///unhide
S s1;
S s2 = s1;
///hide
}
```

---

## and here

```cpp
///options=-fsanitize=address
///fails=alloc-dealloc-mismatch
///hide
#include <string>
#include <iostream>
#include <stdexcept>

///unhide
struct S{
    S(): p{new int[10]} {}
    ~S() { delete p; }
    S(S&& other) : p{other.p} { other.p = nullptr; }

    int* p;
};

///hide
int main() {
///unhide
S s1;
S s2 = std::move(s1);
///hide
}
```

---

## First solution

---

## Don't heap allocate!

![heap](06_smart_pointers/stopit.webp)

---

## When to heap-allocate

- <!-- .element: class="fragment" --> Runtime Polymorphism
- <!-- .element: class="fragment" --> Decouple compilation units (PIMPL)
- <!-- .element: class="fragment" --> An object needs to outlive its scope

---

## second solution

---

<!-- .slide: data-background-image="06_smart_pointers/smart.webp" -->

# Smart pointers

<!-- .element: class="chapter bottom" -->

---

## Smart pointers

> a smart pointer is an abstract data type that simulates a pointer while providing additional features, such as automatic memory management or bounds checking.

---

## Ownership

The owner of a dynamically allocated object is the one who is responsible to delete it. 
There are three patterns of object ownership:
- Creator as a Sole Owner
- Sequence of Owners
- Shared Ownership

---

## Creator as a Sole Owner

When a class creates and deletes a resource:

```cpp
///hide
class Object{};

///unhide
struct DumbSingleOwner
{
    DumbSingleOwner() : m_pObject(new Object)
    {}

    ~DumbSingleOwner()
    {
        delete m_pObject;
    }

    Object* m_pObject;
};
```

---

<!-- .slide: id="unique_ptr" -->

## Use `std::unique_ptr`

```cpp
#include <memory>
///hide

class Object{};
///unhide

struct SmartSingleOwner
{
    SmartSingleOwner() : m_pObject(new Object)
    {}
    std::unique_ptr<Object> m_pObject;
};
```

Note: Keeps the rule of 0

---

## How does it work?

`unique_ptr` deletes the stored object on its destructor.

---

## Testing

```cpp
///hide
#include <iostream>
#include <memory>

///unhide
struct Object
{
    Object(){ std::cout << "Object constructed\n"; }

    ~Object(){ std::cout << "Object destructed\n"; }
};
///hide

struct DumbSingleOwner
{
    DumbSingleOwner() : m_pObject(new Object)
    {}

    ~DumbSingleOwner()
    {
        delete m_pObject;
    }

    Object* m_pObject;
};

struct SmartSingleOwner
{
    SmartSingleOwner() : m_pObject(new Object)
    {}
    std::unique_ptr<Object> m_pObject;
};
///unhide

int main()
{
    {
        DumbSingleOwner dumb;
    }
    {
        SmartSingleOwner smart;
    } 
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## Can be used as a raw pointer

```cpp [4|5|6]
///hide
#include <string>
#include <memory>
#include <iostream>

///unhide
int main()
{
    std::unique_ptr<std::string> pInt(new std::string("Hello"));
    pInt->append(" World");
    if (pInt)
        std::cout << *pInt << '\n';
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## other useful methods

- `.get()` - returns the stored pointer
- `.reset()` - replaces the managed object
- `.release()` - returns a pointer to the managed object and releases the ownership

---

## Sequence of Owners

Who should delete the created object?

```cpp
///hide
class Object;

///unhide
class Factory
{
public:
    virtual Object* createObject() = 0;
};
```

---

## The caller?

```cpp
///hide
class Object {};

class Factory
{
public:
    virtual Object* createObject() = 0;
};

///unhide
class FreeSpiritFactory : public Factory
{
public:
    Object* createObject() override
    {
        return new Object;
    }
};
```

---

## The factory?

```cpp
///hide
#include <vector>
#include <algorithm>

class Object {};

class Factory
{
public:
    virtual Object* createObject() = 0;
};

///unhide
class AccountantFactory : public Factory
{
public:
    Object* createObject() override
    {
        m_objects.push_back(new Object);
        return m_objects.back();
    }

    ~AccountantFactory()
    {
        std::for_each(m_objects.begin(), m_objects.end(), [](Object* p){
            delete p;
        });
    }

private:
    std::vector<Object*> m_objects;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

## Use `std::unique_ptr`

Now it is clear the caller gets ownership

```cpp
///hide
#include <memory>

class Object {};

///unhide
class SmartFactory
{
public:
    std::unique_ptr<Object> createObject()
    {
        return std::unique_ptr<Object>{ new Object() };
    }
};
```

---

## How does it work?

- The copy constructor and assignment operator of `std::unique_ptr` are deleted. 
- It only has a move constructor and move assignment operator.
- When moved from, the original `std::unique_ptr` releases the object and the destination `std::unique_ptr` acquires it.

---

## Example

```cpp
///hide
#include <memory>
#include <cassert>

int main() {
///unhide
std::unique_ptr<int> pInt(new int(1)); 
// std::unique_ptr<int> pIntCopy = pInt; // doesn't compile
std::unique_ptr<int> pIntMove = std::move(pInt);
assert(pIntMove && !pInt);
///hide
}
```

---

## Unique array

```cpp [2,4]
///hide
#include <memory>
#include <cstdio>
#include <cstring>

int main() {
///unhide
auto pHello = "Hello World!";
std::unique_ptr<char[]> pCharArray(new char[strlen(pHello) + 1]);
sprintf(pCharArray.get(), pHello);
printf("third letter is %c\n", pCharArray[2]);
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## Shared ownership

What if the factory does want to keep a reference to the created object?

If the factory would return a pointer, the user might already delete it by the time the factory references it!

---

<!-- .slide: id="emplace" class="aside" -->

## `emplace_back`

constructs a collection element in place

```cpp [1-8|12|13]
///hide
#include <iostream>
#include <string>
#include <vector>

///unhide
struct S {
    explicit S(const std::string &s): s{s} 
    { std::cout << "Ctor " << s << "\n"; }
    S(S&& other): s{std::move(other.s)} 
    { std::cout << "Move Ctor " << s << "\n"; }

    std::string s;
};

///hide
int main() {
///unhide
std::vector<S> v;
v.reserve(2);
v.push_back(S("pushed"));
v.emplace_back("emplaced");
///hide
}
```

---

<!-- .slide: class="aside" -->

# `emplace`

```cpp
///hide
#include <string>
#include <map>

int main() {
///unhide
std::map<std::string, std::string> m;
m.emplace("key", "value");
///hide
}
```

---

<!-- .slide: id="shared_ptr" -->

## Use `std::shared_ptr`

```cpp
///hide
#include <memory>
#include <vector>

class Object {};

///unhide
class SmartAccountant
{
public:
    std::shared_ptr<Object> createObject()
    {
        m_createdObjects.emplace_back(new Object);
        return m_createdObjects.back();
    }

private:
    std::vector<std::shared_ptr<Object>> m_createdObjects;
};
```

---

## How does it work?

The `shared_ptr` works on reference counting, so as long as the factory holds a reference to the created object, it is guaranteed not be deleted. 

---

## no free lunch

<!-- .element: class="chapter bottom" -->

<!-- .slide: data-background-image="06_smart_pointers/lunch.gif" data-background-size="contain" -->

---

## Counting has its cost

- A counter should be allocated on the heap
- On each copy of the `shared_ptr` the counter is incremented and on each destruction, decremented.

---

## So, what to do?

- Use shared ownership only if you must
- Pass `shared_ptr` by const reference to functions so less copies will occur.
- Allocate with `make_shared`

---

## `std::make_shared`

Instead of:

```cpp
///hide
#include <memory>

int main(){
///unhide
std::shared_ptr<int> pInt1(new int(5));
///hide
}
```

Write:

```cpp
///hide
#include <memory>

int main(){
///unhide
auto pInt2 = std::make_shared<int>(5);
///hide
}
```

---

## Why is it good?

- Allocates the counter together with the object – one less dynamic memory allocation and improved locality.
- Can prevent memory leaks on certain situations.

---

<!-- .slide: id="make_unique" -->

## `std::make_unique`

Similarly, the standard library offers `make_unique` to allocate unique pointers.

```cpp
///hide
#include <memory>
#include <cmath>

int main(){
///unhide
auto pFloat = std::make_unique<float>(INFINITY);
///hide
}
```

Note: to conclude...

---

## C++ Core Guidelines [R.5](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r5-prefer-scoped-objects-dont-heap-allocate-unnecessarily)

> Prefer scoped objects, don’t heap-allocate unnecessarily

---

## C++ Core Guidelines [C.149](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c149-use-unique_ptr-or-shared_ptr-to-avoid-forgetting-to-delete-objects-created-using-new)

> Use `unique_ptr` or `shared_ptr` to avoid forgetting to delete objects created using new

---

## C++ Core Guidelines [R.11](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r11-avoid-calling-new-and-delete-explicitly)

> Avoid calling `new` and `delete` explicitly

---

## Custom deleters

- By default, smart pointers call `delete` (or `delete[]` in case of `unique_ptr<T[]>`), to free the managed object.
- The user can choose to call any other function.

---

## Shared array

A custom deleter of a `shared_ptr` is sent as a second parameter to the constructor:

```cpp
///options=-std=c++11
///hide
#include <memory>

int main(){
///unhide
auto pSharedArray = std::shared_ptr<int[]>(new int[3], 
[](int* p)
{
    delete[] p;
});
///hide
}
```

---

## Not just memory

Custom deleters enable the standard smart pointers to manage other resources besides memory:

```cpp
///external
///compiler=vcpp_v19_24_x64
///options=/O2
///hide
#include <type_traits>
#include <memory>
///unhide
#include <Windows.h>

///hide

void load() {
///unhide
using LibType = typename std::remove_pointer<HINSTANCE>::type;
auto pLib = std::shared_ptr<LibType>(LoadLibrary("somelib.dll"), FreeLibrary);
if (pLib)
{
    GetProcAddress(pLib.get(), "makeObject");
}
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

## `unique_ptr` custom deleter

A custom deleter of a `unique_ptr` should be declared as a second template parameter:

```cpp
///hide
#include <memory>
#include <cstdio>

int main() {
///unhide
auto pMalloced = std::unique_ptr<char, void(*)(char*)>((char*)malloc(4), 
                                                       [](char* p)
{
    free(p);
});

auto pFile = std::unique_ptr<FILE, int(*)(FILE*)>(fopen("myfile.txt", "wt"), 
                                                  [](FILE* f){
    return fclose(f);
});
fprintf(pFile.get(), "Hello World!");
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

## Leaky marriage

```cpp [13-17,21|25-30]
///hide
#include <string>
#include <memory>
#include <iostream>

///unhide
class Person
{
public:
    Person(const std::string& name)
     : m_name(name)
    {
        std::cout << m_name << " created.\n";
    }
    ~Person()
    {
        std::cout << m_name << " destroyed.\n";
    }
    void marry
        (const std::shared_ptr<Person>& spouse)
    {
        m_spouse = spouse;
    }

private:
    std::string              m_name;
    std::shared_ptr<Person>  m_spouse;
};
int main()
{
    auto chandler 
        = std::make_shared<Person>("Chandler");
    auto monica 
        = std::make_shared<Person>("Monica");
    chandler->marry(monica);
    monica->marry(chandler);
}












```

<!-- .element: class="split" style="font-size: 0.35em" -->

---

## What happened?

![cycle](06_smart_pointers/marriage.svg)

When there is a cycle of `shared_ptr`s pointing to each other, they all keep each other from being destroyed.

---

<!-- .slide: id="weak_ptr" -->

## use `std::weak_ptr`

Should be constructed from an existing `shared_ptr`:

```cpp
///hide
#include <memory>

int main() {
///unhide
auto pSharedChar = std::make_shared<char>('x');
std::weak_ptr<char> pWeakChar(pSharedChar);
///hide
}
```

---

## `std::weak_ptr`

To access the owned pointer, the user should call `lock()` to get a new `shared_ptr` to the object, if it hasn’t been freed or an empty `shared_ptr` otherwise.

```cpp
///hide
#include <memory>
#include <cstdio>

int main() {
auto pSharedChar = std::make_shared<char>('x');
std::weak_ptr<char> pWeakChar(pSharedChar);
///unhide
if (auto pSharedChar2 = pWeakChar.lock())
{
    printf("%c\n", *pSharedChar2);
}
///hide
}
```

---

## How does it work?

- Each `shared_ptr` contains two counters – one for strong references and another one for weak references.
- When a `shared_ptr` is destroyed, the decision whether to call the deleter is only based on the strong counter.
- The counters themselves are freed when both counters reach 0.

---

## Back to marriage

```cpp [13-17,21]
///hide
#include <string>
#include <memory>
#include <iostream>

///unhide
class Person
{
public:
    Person(const std::string& name)
     : m_name(name)
    {
        std::cout << m_name << " created.\n";
    }
    ~Person()
    {
        std::cout << m_name << " destroyed.\n";
    }
    void marry(
        const std::shared_ptr<Person>& spouse)
    {
        m_spouse = spouse;
    }

private:
    std::string              m_name;
    std::weak_ptr<Person>    m_spouse;
};
int main()
{
    auto chandler 
        = std::make_shared<Person>("Chandler");
    auto monica 
        = std::make_shared<Person>("Monica");
    chandler->marry(monica);
    monica->marry(chandler);
}












```

<!-- .element: class="split" style="font-size:0.35em" -->

---

## better for factory

```cpp [12]
///hide
#include <memory>
#include <vector>

class Object{};

///unhide
class SmarterAccountant
{
public:
    std::shared_ptr<Object> createObject()
    {
        auto res = std::make_shared<Object>();
        m_createdObjects.emplace_back(res);
        return res;
    }

private:
    std::vector<std::weak_ptr<Object>> m_createdObjects;
};
```

---

## casting

The standard library provides functions to cast **`shared_ptr`s**:

```cpp [1-9|13-16]
///hide
#include <memory>

///unhide
struct Base
{
    virtual ~Base();
};

struct Derived : public Base
{
    void doSomething() {}
};

void smartDowncaster(const std::shared_ptr<Base>& pBase)
{
    if (auto pDerived = std::dynamic_pointer_cast<Derived>(pBase))
    {
        pDerived->doSomething();
    }
}
```

<!-- .element: style="font-size: 0.45em" -->

---

## casting

<div style="text-align: left">

There's also

- `static_pointer_cast`
- `const_pointer_cast`
- `reinterpret_pointer_cast` (Since C++17)

</div>

Note: Since casting creates a copy of the pointer, it can be used with `shared_ptr`s only! If needed, one can first call `get()` on the `unique_ptr` to get the raw pointer and cast the result, but this is generally considered a bad design.

---

<!-- .slide: id="attributes" class="aside" -->

## attributes

- Standardized GNU's `__attribute__` and MSVC’s `__declspec`
- <!-- .element: class="fragment" --> can be used almost everywhere in the C++ program, and can be applied to almost everything
- <!-- .element: class="fragment" --> each particular attribute is only valid where it is permitted by the implementation
- <!-- .element: class="fragment" --> Besides the standard attributes, implementations may support arbitrary non-standard attributes
- <!-- .element: class="fragment" --> All attributes unknown to an implementation are ignored

---

<!-- .slide: class="aside" -->

## Examples

- `[[noreturn]]`
- `[[deprecated("reason")]]` (C++14)
- `[[maybe_unused]]` (C++17)
- `[[likely]]` (C++20)
- `[[gnu::always_inline]]`

---

## time to benchmark

[raw vs. unique vs. shared](https://quick-bench.com/q/FrCYZD3FgKip5Kwn9Uz76RHM97A)

[with inlining](https://quick-bench.com/q/BOW6gJETy-bFADckH42l_vkjP3w)

[`make_shared` vs. `new`](https://quick-bench.com/q/3J4mZ3uN45kbDosFrpOsMN5BNsk)

---

<!-- .slide: data-auto-animate -->

## do work

```cpp [1-5|9-13]
struct ThreadPool
{
    template<typename F>
    void execute(F&&);
};

///hide
template<typename F>
void ThreadPool::execute(F&&) {}

///unhide
struct Work
{
    void execute() {
        m_pool.execute([this]{
            doWork();
        });
    }

    void doWork();

    ThreadPool m_pool;
};
```

<!-- .element: data-id="code" style="font-size: 0.35em" -->

Note: what if work is destoryed before the pool?

<div class="footnote">

Source: [nextptr](https://www.nextptr.com/tutorial/ta1414193955/enable_shared_from_this-overview-examples-and-internals)

</div>

---

<!-- .slide: data-auto-animate -->

## do work

```cpp [12-15]
#include <memory>

struct ThreadPool
{
    template<typename F>
    void execute(F&&);
};

///hide
template<typename F>
void ThreadPool::execute(F&&) {}

///unhide
struct Work
{
    void execute() {
        auto self = std::shared_ptr<Work>(this);
        m_pool.execute([self]{
            self->doWork();
        });
    }

    void doWork();

    ThreadPool m_pool;
};
```

<!-- .element: data-id="code" style="font-size: 0.35em" -->

---

<!-- .slide: data-auto-animate -->

## do work

```cpp [6,17-18]
#include <memory>

///hide
struct ThreadPool
{
    template<typename F>
    void execute(F&&);
};

template<typename F>
void ThreadPool::execute(F&&) {}

///unhide
struct Work
{
    void execute() {
        auto self = std::shared_ptr<Work>(this);
        m_pool.execute([self]{
            self->doWork();
        });
    }

    void doWork();

    ThreadPool m_pool;
};

///hide
void Work::doWork() {}

int main() {
///unhide
auto work = std::make_shared<Work>();
work->doWork();
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.35em" -->

---

<!-- .slide: data-auto-animate -->

## `std::enable_shared_from_this`

```cpp [3,6]
#include <memory>

///hide
struct ThreadPool
{
    template<typename F>
    void execute(F&&);
};

template<typename F>
void ThreadPool::execute(F&&) {}

///unhide
struct Work : std::enable_shared_from_this<Work>
{
    void execute() {
        auto self = shared_from_this();
        m_pool.execute([self]{
            self->doWork();
        });
    }

    void doWork();

    ThreadPool m_pool;
};

///hide
void Work::doWork() {}

int main() {
///unhide
auto work = std::make_shared<Work>();
work->doWork();
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.4em" -->

---

<!-- .slide: data-auto-animate -->

## how to pass smart pointers

C++ Core Guidelines [R.32](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r32-take-a-unique_ptrwidget-parameter-to-express-that-a-function-assumes-ownership-of-a-widget): Take a `unique_ptr<widget>` parameter to express that a function assumes ownership of a widget

```cpp
///hide
#include <memory>

class widget;

///unhide
// takes ownership of the widget
void sink(std::unique_ptr<widget>);
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: data-auto-animate -->

## how to pass smart pointers

C++ Core Guidelines [R.33](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r33-take-a-unique_ptrwidget-parameter-to-express-that-a-function-reseats-thewidget): Take a `unique_ptr<widget>&` parameter to express that a function reseats the `widget`

```cpp
///hide
#include <memory>

class widget;

///unhide
// "will" or "might" reseat pointer
void reseat(std::unique_ptr<widget>&);
```

<!-- .element: data-id="code2" -->

Note: Note "reseat" means "making a pointer or a smart pointer refer to a different object."

---

<!-- .slide: data-auto-animate -->

## how to pass smart pointers

C++ Core Guidelines [R.34](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r34-take-a-shared_ptrwidget-parameter-to-express-that-a-function-is-part-owner): Take a `shared_ptr<widget>` parameter to express that a function is part owner

```cpp
///hide
#include <memory>

class widget;

///unhide
// share -- "will" retain refcount
void share(std::shared_ptr<widget>);
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: data-auto-animate -->

## how to pass smart pointers

C++ Core Guidelines [R.35](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r35-take-a-shared_ptrwidget-parameter-to-express-that-a-function-might-reseat-the-shared-pointer): Take a `shared_ptr<widget>&` parameter to express that a function might reseat the shared pointer

```cpp
///hide
#include <memory>

class widget;

///unhide
// "might" reseat ptr
void reseat(std::shared_ptr<widget>&);
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: data-auto-animate -->

## how to pass smart pointers

C++ Core Guidelines [R.36](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#r32-take-a-unique_ptrwidget-parameter-to-express-that-a-function-assumes-ownership-of-a-widget): Take a `const shared_ptr<widget>&` parameter to express that it might retain a reference count to the object

```cpp
///hide
#include <memory>

class widget;

///unhide
// "might" retain refcount
void may_share(const std::shared_ptr<widget>&);
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: data-background-image="06_smart_pointers/thanks.webp" data-background-size="contain" -->