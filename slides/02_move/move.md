<!-- .slide: data-background-image="02_move/neville.jpg" -->

---

## How many copies?

```cpp
///hide
#include <vector>
#include <cstdint>

///unhide
template<typename Buffer>
std::vector<Buffer> generateBuffers(const size_t INSTANCES, 
                                    const size_t BUFFER_SIZE)
{
    std::vector<Buffer> v;
    for (size_t i = 0; i < INSTANCES; ++i)
    {
        v.push_back(Buffer(BUFFER_SIZE));
    }
    return v;
}
```

Note:
- copying from temporary buffer
- copying when capacity is full
- possible copying when returning `v`
- in all theses cases the source is destroyed immediately after copying

---

<!-- .slide: class="aside" -->

## Member initialization

```cpp [|4-6|6]
///hide
#include <string>
struct HashingFunction{
    HashingFunction(const std::string&);
};
struct D {};
int f(D);
///unhide
class A
{
public:
    A() : a(7), b(5), hash_algorithm("MD5"), s("Constructor run") {}
    A(int a_val) : a(a_val), b(5), hash_algorithm("MD5"), s("Constructor run") {}
    A(D d) : a(f(d)), b(a), hash_algorithm("MD5"), s("Constroctor run") {}
private:
    int a, b;
    HashingFunction hash_algorithm;
    std::string s;
};
```

<!-- .element: style="font-size:0.4em;" -->

---

<!-- .slide: class="aside" -->

## Non-static data member initializers

```cpp [|8-10|4-6]
///hide
#include <string>
struct HashingFunction{
    HashingFunction(const std::string&);
};
struct D {};
int f(D);
///unhide
class A
{
public:
    A() {}
    A(int a_val) : a(a_val) {}
    A(D d) : a(f(d)), b(a) {}
private:
    int a = 7, b = 5;
    HashingFunction hash_algorithm = HashingFunction("MD5");
    std::string s = "Constructor run";
};
```

<!-- .element: style="font-size: 0.5em" -->

Note: `auto` is not allowed even with initializer;

---

<!-- .slide: id="delegating_constructors" class="aside" -->

## Delegating constructors

```cpp [|4-9|10]
///hide
#include <string>
struct HashingFunction{
    HashingFunction(const std::string&);
};
struct D {};
int f(D);
///unhide
class A
{
public:
    A(int _a = 7, 
      int _b = 5, 
      const HashingFunction& _hash_algorithm = HashingFunction("MD5"), 
      const std::string& _s = "Constructor run") 
    : a(_a), b(_b), hash_algorithm(_hash_algorithm), s(_s) 
    {}
    A(D d) : A(f(d), a) {}
private:
    int a, b;
    HashingFunction hash_algorithm;
    std::string s;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

<!-- .slide: id="nullptr" class="aside" -->

## `nullptr`

A type safe replacement for `NULL` macro

```cpp
///external
///compiler=vcpp_v19_24_x64
///options=/O2
///hide
#include <cstddef>
///unhide
void foo(int);
void foo(char*);

///hide
int main(){
///unhide
foo(42); // calls foo(int);
foo(NULL); // calls foo(int);
foo(nullptr); // calls foo(char*);
///hide
}
```

---

## Buffer copy

```cpp [|2-3|5-10|12-18|20-29|31]
///hide
#include <algorithm>
///unhide
struct Buffer {
    size_t m_size;
    int* m_pArray;

    Buffer(size_t size = 0) 
        : m_size(size)
        , m_pArray(size == 0 
                    ? nullptr 
                    : new int[size])
    {}

    Buffer(const Buffer& other) 
        : Buffer(other.m_size)
    {
        std::copy(other.m_pArray, 
                  other.m_pArray + m_size, 
                  m_pArray);
    }

    Buffer& operator=(const Buffer& other) 
    {
        delete[] m_pArray;
        m_size = other.m_size;
        m_pArray = new int[m_size];
        std::copy(other.m_pArray, 
                  other.m_pArray + m_size, 
                  m_pArray);
        return *this;
    }

    ~Buffer() { delete[] m_pArray; }
};






```

<!-- .element: class="split" -->

---

## implement assignment by copy constructor

```cpp [20-26]
///hide
#include <algorithm>
///unhide
struct Buffer {
    size_t m_size;
    int* m_pArray;

    Buffer(size_t size = 0) 
        : m_size(size)
        , m_pArray(size == 0 
                    ? nullptr 
                    : new int[size])
    {}

    Buffer(const Buffer& other) 
        : Buffer(other.m_size)
    {
        std::copy(other.m_pArray, 
                  other.m_pArray + m_size, 
                  m_pArray);
    }
    
    Buffer& operator=(const Buffer& other) 
    {
        Buffer tmp(other);
        std::swap(m_size, tmp.m_size);
        std::swap(m_pArray, tmp.m_pArray);
        return *this;
    }

    ~Buffer() { delete[] m_pArray; }
};








```

<!-- .element: class="split" -->

---

## Steal from temporary

```cpp
///hide
#include <cstddef>
struct Buffer {
size_t m_size;
int* m_pArray;

Buffer(size_t size = 0) 
    : m_size(size)
    , m_pArray(size == 0 
                ? nullptr 
                : new int[size])
{}
///unhide
Buffer(const Buffer& temporary)
    : m_size(temporary.m_size)
    , m_pArray(temporary.m_pArray)
{}
///hide
~Buffer() { delete[] m_pArray; }
};
```

Note: 
- As we know the temporary won’t be used after the assignment operator, why not “move” its resources to the new object instead of copy them?
- There's a problem with this code though - double delete

---

## Without double delete

```cpp
///hide
#include <cstddef>
struct Buffer {
size_t m_size;
int* m_pArray;

Buffer(size_t size = 0) 
    : m_size(size)
    , m_pArray(size == 0 
                ? nullptr 
                : new int[size])
{}
///unhide
Buffer(Buffer& temporary)
    : m_size(temporary.m_size)
    , m_pArray(temporary.m_pArray)
{
    temporary.m_size = 0;
    temporary.m_pArray = nullptr;
}
///hide
~Buffer() { delete[] m_pArray; }
};
```

---

<!-- .slide: data-background-image="02_move/move_it.gif" data-background-size="contain" data-transition="none slide" -->

# Move semantics
<!-- .element: style="text-shadow: 3px 3px black; color: lightblue; position: fixed; top: 0; left: 8%" -->

---

## How can we tell?

```cpp
///hide
#include <algorithm>

struct Buffer {
    size_t m_size;
    int* m_pArray;

    Buffer(size_t size = 0) 
        : m_size(size)
        , m_pArray(size == 0 
                    ? nullptr 
                    : new int[size])
    {}
    Buffer(const Buffer& other)
        : Buffer(other.m_size)
    {
        std::copy(other.m_pArray, 
                    other.m_pArray + m_size, 
                    m_pArray);
    }
    ~Buffer() { delete[] m_pArray; }
};

int main() {
const auto BUFFER_SIZE = 4;
///unhide
Buffer c = Buffer(BUFFER_SIZE); // can move
Buffer d = c; // cannot move
// keep using c and d
///hide
}
```

Note:
We need a way to distinguish between references to temporary objects and regular objects.

---

## Value type

Originally:

> - l-value: can be on the left hand side of an assignment
> - r-value: can be **only** on the right hand side of an assignment

---

## Left or right?

```cpp [|4|5|6|7|8|9]
///hide
#include <vector>
#include <algorithm>

using std::min;

int main() {
///unhide
int a, b, *p;
std::vector<int> v(2);

a         = 42;
b         = a;
b         = a * b;
p         = new int;
*p        = min(a, b);
v.front() = 6;
///hide
}
```

---

## Value type

More accurately: 

> an expression is an *l*-value if it has a specific memory location and its address can be taken using the & operator, otherwise it is an *r*-value.

---

## Value type

```cpp
///fails=lvalue required as unary '&' operand
///hide
void foo() {
///unhide
int a, b;
int* c;
c = &a;
c = &(a * b); // error
///hide
}
```

All expressions returning temporary values are r-values.

All named objects are l-values.

---

## L-value references

A (non-const) reference can be bound only to l-values:

```cpp
///fails=cannot bind non-const lvalue reference of type 'int&' to an rvalue of type 'int'
int a, b;
int& c = a;
int& d = (a * b); // error
```

---

<!-- .slide: id="rvalue_references" -->

## R-value references

Can be bound only to r-values and uses the && syntax.

```cpp
///fails=cannot bind rvalue reference of type 'int&&' to lvalue of type 'int'
int a = 1, b = 2;
int&& c = a; // error
int&& d = (a * b);
cout << ++d << endl;
```

Note: `d` is extending the lifetime of `(a * b)`

---

<!-- .slide: id="move_constructors" -->

## Move constructor and assignment operator

```cpp [|3-11,22-24|13-20|26-33]
///hide
#include <cstddef>
#include <utility>

///unhide
struct MovableBuffer
{
    size_t m_size;
    int* m_pArray;

    MovableBuffer(size_t size = 0);

    ~MovableBuffer() { delete[] m_pArray; }

    // copy constructor
    MovableBuffer(const MovableBuffer& other); 

    // move constructor
    MovableBuffer(MovableBuffer&& other)
        : m_size(other.m_size)
        , m_pArray(other.m_pArray)
    {
        other.m_size = 0;
        other.m_pArray = nullptr;
    }

    // copy assignment operator
    MovableBuffer& operator=(
        const MovableBuffer& other);

    // move assignment operator
    MovableBuffer& operator=(MovableBuffer&& other)
    {
        MovableBuffer tmp(other);
        std::swap(m_size, tmp.m_size);
        std::swap(m_pArray, tmp.m_pArray);
        return *this;
    }
};








```

<!-- .element: class="split" -->

---

# [Let's benchmark](http://quick-bench.com/ryKzdF90wADpRQ6hHuvUvhat1Z0)

---

## Move only

```cpp [|20]
///fails=use of deleted function 'constexpr MoveOnlyBuffer::MoveOnlyBuffer(const MoveOnlyBuffer&)'
///hide
#include <cstddef>
#include <utility>

///unhide
struct MoveOnlyBuffer
{
    size_t m_size;
    int* m_pArray;

    MoveOnlyBuffer(size_t size = 0);

    ~MoveOnlyBuffer() { delete[] m_pArray; }
    
    MoveOnlyBuffer(MoveOnlyBuffer&& other) 
        : m_size(other.m_size)
        , m_pArray(other.m_pArray)
    {
        other.m_size = 0;
        other.m_pArray = nullptr;
    }

    MoveOnlyBuffer& operator=(MoveOnlyBuffer&& other)
    {
        MoveOnlyBuffer tmp(other);
        std::swap(m_size, tmp.m_size);
        std::swap(m_pArray, tmp.m_pArray);
        return *this;
    }
};








```

<!-- .element: class="split" -->

Note: 
- show compiler error
- performance bug in the movable class

---

## `std::move`

casts the argument to an `rvalue`

```cpp
///hide
#include <type_traits>
///unhide
namespace std {

template< class T >
typename remove_reference<T>::type&& move( T&& t ) noexcept {
    return static_cast<typename remove_reference<T>::type&&>(t);
}

} // namespace std
```

<!-- .element: style="font-size: 0.5em;" -->

---

## (really) move only

```cpp [20]
///hide
#include <cstddef>
#include <utility>

///unhide
struct MoveOnlyBuffer
{
    size_t m_size;
    int* m_pArray;

    MoveOnlyBuffer(size_t size = 0);

    ~MoveOnlyBuffer() { delete[] m_pArray; }
    
    MoveOnlyBuffer(MoveOnlyBuffer&& other) 
        : m_size(other.m_size)
        , m_pArray(other.m_pArray)
    {
        other.m_size = 0;
        other.m_pArray = nullptr;
    }

    MoveOnlyBuffer& operator=(MoveOnlyBuffer&& other)
    {
        MoveOnlyBuffer tmp(std::move(other));
        std::swap(m_size, tmp.m_size);
        std::swap(m_pArray, tmp.m_pArray);
        return *this;
    }
};








```

<!-- .element: class="split" -->

---

# [Let's benchmark](http://quick-bench.com/mevho4kNsJTPbnA7S8zrFToi5Is)

---

## Exception safety

<table style="font-size:0.55em">
    <tr>
        <td>Nothrow exception guarantee</td> <td>the function never throws exceptions</td>
    </tr>
    <tr>
        <td>Strong exception guarantee</td> <td>If the function throws an exception, the state of the program is rolled back to the state just before the function call</td>
    </tr>
    <tr>
        <td>Basic exception guarantee</td> <td>If the function throws an exception, the program is in a valid state. No resources are leaked, and all objects' invariants are intact</td>
    </tr>
    <tr>
        <td>No exception guarantee</td> <td><img src="02_move/dragons.jpg" alt="dragons" style="position: relative; height: 20%; left: 30%"></img></td>
    </tr>
</table>

---

`vector::push_back` pseudo code

```cpp
///fails=expected initializer before '<' token
template<typename T>
void vector<T>::push_back(const T& value) {
    if (size == capacity) {
        allocate larger buffer
        if (is movable) {
            // move all Ts to the new buffer
        } else {
            // copy all Ts to the new buffer
        }
    }
    // copy value to the end if the buffer
}
```

---

## copy

<svg class="animated" width="80%" xmlns="http://www.w3.org/2000/svg">
    <defs>
          <pattern id="empty" x="2" y="2" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="38" height="38" fill= "#ffffff" stroke= "#333333" stroke-width="2" />
          </pattern>
          <pattern id="full" x="2" y="2" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="38" height="38" fill= "#876fc1" stroke= "#333333" stroke-width="2" />
          </pattern>
    </defs>
    <text x="2" y="35" fill="white">Old</text>
    <rect x="122" y="2" width="400" height="40" fill="url(#full)" />
    <text class="error" x="322" y="75" fill="red" style="opacity: 0">
        ERROR
    </text>
    <g class="new">
        <text x="2" y="115" fill="white">New</text>
        <rect x="122" y="82" width="600" height="40" fill="url(#empty)" />
        <rect class="filling" x="122" y="82" width="200" height="40" fill="url(#full)" />
    </g>
</svg>

---

## move

<svg class="animated" width="80%" xmlns="http://www.w3.org/2000/svg">
    <defs>
          <pattern id="empty" x="2" y="2" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="38" height="38" fill= "#ffffff" stroke= "#333333" stroke-width="2" />
          </pattern>
          <pattern id="full" x="2" y="2" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="38" height="38" fill= "#876fc1" stroke= "#333333" stroke-width="2" />
          </pattern>
    </defs>
    <text x="2" y="35" fill="white">Old</text>
    <rect x="122" y="2" width="400" height="40" fill="url(#full)" />
    <rect class="filling" x="122" y="2" width="200" height="40" fill="url(#empty)" />
    <text class="error" x="322" y="75" fill="red" style="opacity: 0">
        ERROR
    </text>
    <g class="new">
        <text x="2" y="115" fill="white">New</text>
        <rect x="122" y="82" width="600" height="40" fill="url(#empty)" />
        <rect class="filling" x="122" y="82" width="200" height="40" fill="url(#full)" />
    </g>
</svg>

---

<!-- .slide: id="noexcept_specifier" -->

## `noexcept` specifier

A function can be decorated with `noexcept(expr)` specifier to indicate whether it will throw:

```cpp
int* allocate_array_impl(int N){
    return new int[N];
}

template<int N>
int* allocate_array() noexcept(N >= 0) {
    return allocate_array_impl(N);
}

int* a = allocate_array<42>();
int* b = allocate_array<-1>();
```

`noexcept` is a shortcut for `noexcept(true)`.

---

<!-- .slide: id="noexcept_operator" -->

## `noexcept` operator

`noexcept(expr)` returns `true` if `expr` is declared to not throw any exceptions.

```cpp
template<typename Func>
void wrapper(Func func) noexcept(noexcept(func())) {
    func();
}
```

---

- destructors are implicitly `noexcept`
- if a `noexcept` function throws, the function `std::terminate` is called 

```cpp
extern void f();  // potentially-throwing
void g() noexcept {
    f();      // valid, even if f throws
    throw 42; // valid, effectively a call to std::terminate
}
```

---

## `noexcept` move

```cpp [14, 27-28]
///hide
#include <cstddef>
#include <utility>

///unhide
struct MovableBuffer
{
    size_t m_size;
    int* m_pArray;

    MovableBuffer(size_t size = 0);

    ~MovableBuffer() { delete[] m_pArray; }

    // copy constructor
    MovableBuffer(const MovableBuffer& other); 

    // move constructor
    MovableBuffer(MovableBuffer&& other) noexcept
        : m_size(other.m_size)
        , m_pArray(other.m_pArray)
    {
        other.m_size = 0;
        other.m_pArray = nullptr;
    }

    // copy assignment operator
    MovableBuffer& operator=(
        const MovableBuffer& other);

    // move assignment operator
    MovableBuffer& operator=(
        MovableBuffer&& other) noexcept
    {
        MovableBuffer tmp(std::move(other));
        std::swap(m_size, tmp.m_size);
        std::swap(m_pArray, tmp.m_pArray);
        return *this;
    }
};






```

<!-- .element: class="split" -->

---

# [Let's benchmark](http://quick-bench.com/Po3o1F2MuAsyRNciCaOoAcnQbyY)

---

## `std::move` again

```cpp
///hide
#include <type_traits>
///unhide
template< class T >
typename std::remove_reference<T>::type&& move( T&& t ) noexcept {
    return static_cast<typename std::remove_reference<T>::type&&>(t);
}
```

<!-- .element: style="font-size: 0.48em;" -->

We can also move `lvalue`s that are not needed anymore:

```cpp
///hide
#include <string>
#include <vector>
#include <iostream>

void foo() {
///unhide
std::vector<std::string> inputs;
for (std::string s; std::cin >> s;) {
    inputs.push_back(std::move(s));
}
///hide
}
```

Note: But `s` is an `lvalue`!!

---

## reference collapsing

```cpp
///hide
#include <type_traits>

///unhide
template<typename T>
using lref = T&;

template<typename T>
using rref = T&&;

static_assert(std::is_same<lref<lref<int>>, int&>::value, 
              "& * & = &");
static_assert(std::is_same<lref<rref<int>>, int&>::value, 
              "& * && = &");
static_assert(std::is_same<rref<lref<int>>, int&>::value, 
              "&& * & = &");
static_assert(std::is_same<rref<rref<int>>, int&&>::value, 
              "&& * && = &&");
```

---

## forwarding ref

calling `std::move(s)` instantiates 

```cpp
///fails='move' in namespace 'std' does not name a template type
std::move<std::string&>(std::string & && t)
```

i.e. 

```cpp
///fails='move' in namespace 'std' does not name a template type
std::move<std::string&>(std::string & t)
```

- `template<typename T>(T&&)` just retains the type of the call site argument
- such a reference is called a **forwarding reference**

---

## `std::forward`

forwards the argument to another function with the value category it had when passed to the calling function.

```cpp
///hide
#include<iostream>
///unhide
template <typename Func, typename T>
auto trace(Func&& f, T&& t) { 
  std::cout << "Calling f on " << t;
  return f(std::forward<T>(t)); 
}
```

---

## Special member functions

| | | |
|-|-|-|
|1.|default constructor|`T()`|
|2.|copy constructor|`T(const T&)`|
|3.|move constructor|`T(T&&)`|
|4.|destructor|`~T()`|
|5.|copy assignment|`T& operator=(const T&)`|
|6.|move assignment|`T& operator=(T&&)`|

<!-- .element: class="noheader noborder" style="font-size: 35px" -->

**Special** - compiler generated, under certain circumstances

---

![special members](02_move/special_members.jpg) <!-- .element: width="75%" -->

Source: [Howard Hinnant](https://howardhinnant.github.io/classdecl.html)

---

<!-- .slide: id="deleted" -->

## deleted function

e.g. to prevent narrowing conversions:

```cpp
///fails=use of deleted function 'void foo(int)'
void foo(short i);
void foo(int i) = delete;

///hide
void bar() {
///unhide
foo(static_cast<short>(42));    // ok
foo(42);                        // error, deleted function
///hide
}
```

---

<!-- .slide: id="defaulted" -->

## defaulted special member function

can force the compiler to generate

```cpp
///hide
#include <type_traits>

///unhide
struct T {
    T() = default;
    T(int i);

    T(T&&);
    T(const T&) = default;
};

static_assert(std::is_default_constructible<T>::value, 
              "default");
static_assert(std::is_copy_constructible<T>::value, 
              "copy");
```

---

## rule of 0

> If you can avoid defining default operations, do

---

## rule of 5(6)

> If you define or =delete any default operation, define or =delete them all

---

## class prototypes:

<div class="r-stack r-stretch">

```cpp
class normal
{
public:
    // rule of zero
};
```

```cpp
class container
{
public:
    container() noexcept;
    ~container() noexcept;

    container(const container& other);
    container(container&& other) noexcept;

    container& operator=(const container& other);
    container& operator=(container&& other) noexcept;
};
```

<!-- .element: class="fragment current-visible" -->

```cpp
class resource_handle
{
public:
    resource_handle() noexcept;
    ~resource_handle() noexcept;

    resource_handle(resource_handle&& other) noexcept;
    resource_handle& operator=(resource_handle&& other) noexcept;

    resource_handle(const resource_handle&) = delete;
    resource_handle& operator=(const resource_handle&) = delete;
};
```

<!-- .element: class="fragment current-visible" style="font-size:0.5em" -->

```cpp
class immoveable
{
public:
    immoveable() noexcept;
    ~immoveable() noexcept;

    immoveable(const immoveable&) = delete; 
    immoveable& operator=(const immoveable&) = delete;

    immoveable(immoveable&&) = delete;
    immoveable& operator=(immoveable&&) = delete;
};
```

<!-- .element: class="fragment current-visible" -->

</div>

Source: [Jonathan Müller](https://foonathan.net/2019/02/special-member-functions/)

---

<!-- .slide: data-background-image="02_move/roar.gif" data-transition="none slide" -->

# Thank you
<!-- .element: style="text-shadow: 3px 3px black; color: lightblue; position: fixed; top: 0; left: 20%" -->