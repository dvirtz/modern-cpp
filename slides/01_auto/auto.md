<!-- .slide: data-background-image="01_auto/schmeichel.jpg" -->

---

## What problems can you find in this code?

```cpp
///fails=conversion from 'int' to non-scalar type 'std::vector<int>' requested
///hide
#include <string>
#include <vector>

void foo() {
///unhide
// (a)
int i;

// (b)
std::vector<std::string> v;
int size = v.size();

// (c)
std::vector<int> v1(5);
std::vector<int> v2 = 5;
///hide
}
```

Note:
- uninitialized variable
- possible data lose converting from `size_t` to `int`
- although looking similar, the second line does not compile, because the constructor is *explicit*

---

## And this?

```cpp
///fails=conversion from '__normal_iterator<const int*,[...]>' to non-scalar type '__normal_iterator<int*,[...]>' requested
///hide
#include <vector>
///unhide
void traverser( const std::vector<int>& v ) {
  for( std::vector<int>::iterator i = v.begin(); 
       i != v.end(); 
       ++i )
  {
        // ...
  }
}
```

Note:
- this code does not compile because we need a `const_iterator`

---

## And this?

```cpp
///hide
#include <iostream>

struct gadget{
    gadget() { std::cout << "gadget()\n"; }
    gadget(const gadget&) { std::cout << "gadget(gadget&)\n"; }
};

struct widget{
    widget() { std::cout << "widget()\n"; }
    widget(const gadget&) { std::cout << "widget(gadget&)\n"; }
};
///unhide
gadget get_gadget();
///hide
gadget get_gadget() {
    return gadget();
}

int main() {
///unhide
widget w = get_gadget();
///hide
}
```

<small> assuming `gadget` is implicitly convertible to `widget` </small>

Note:
- a temporary `getget` is created which might be a performance pitfall, as the creation of the temporary object is not at all obvious from reading the call site alone.
- it's possible that using `gadget` is just as well as viable in this code

---

<!-- .slide: class="aside" -->

## Non member `begin` and `end`

Accept anything with a member `begin` and `end` as well as C-style arrays

```cpp
///hide
#include <vector>
#include <cassert>
 
int main() 
{
///unhide
std::vector<int> v = { 3, 1, 4 };
auto vi = std::begin(v);
assert(*vi == 3);

int a[] = { -5, 10, 15 };
auto ai = std::begin(a);
assert(*ai == -5);
///hide
}
```

Note:
- prefer to use this in generic code

---

What does this function do?

```cpp
///hide
#include <algorithm>
#include <cassert>

using namespace std;
///unhide
template<class Container, class Value>
void some_function( Container& c, const Value& v ) {
    if( find(begin(c), end(c), v) == end(c) )
        c.push_back(v); 
    assert( !c.empty() );
}
```

Note:
- `append_unique`

---

<!-- .slide: data-background-image="01_auto/auto.gif" data-transition="none slide" -->

# auto
<!-- .element: style="text-shadow: 3px 3px black; color: lightblue; position: fixed; top: 0; left: 40%" -->

<div class="r-stretch footnote" style="text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black">

Slides are based on [Herb Sutter's](herbsutter.com) GOTW series

</div>

Note: 
- our main topic today
- oldest feature in C++11 (first implementation at 1983)

---

## declaring a local variable

syntax

```cpp
///hide
void foo(int its_initial_value){
///unhide
auto my_new_variable = its_initial_value;
///hide
}
```

deduce type from initializing expression

```cpp
///hide
void foo(int its_initial_value){
///unhide
auto x = 0x12345678ULL; // type of x is unsigned long long
///hide
}
```

---

## similar to template type deduction
```cpp
template<class T> void f( T ) { }

///hide
int main() {
///unhide
int val = 0;

f( val );     // deduces T == int, calls f<int>( val )

auto x = val; // deduces T == int, x is of type int
///hide
}
```

---

## Strips off qualifiers and references
```cpp
///hide
int main() {
///unhide
int           val = 0;

int&          ir  = val;
auto          e   = ir;   // The type of e is int

const int     ci  = val;
auto          h   = ci;   // The type of h is int

const int*    cip = &val;
auto          i   = cip;  // The type of i is const int*

int* const    ipc = &val;
auto          j   = ipc;  // The type of j is int*
///hide
}
```

Note: You want your new variable to be just like some existing variable or expression over there, and be initialized from it, but that only means that you want the same basic type, not necessarily that other variable’s own personal secondary attributes such as top-level const– or volatile-ness and &/&& reference-ness which are per-variable. For example, just because he’s const doesn’t mean you’re const, and vice versa.

---

## Can be qualified

```cpp
///hide
int main() {
///unhide
int         val = 0;
auto        a   = val; // The type of a is int
auto&       b   = val; // The type of b is int&
const auto  c   = val; // The type of c is const int
const auto& d   = val; // The type of d is const int&
///hide
}
```

Note: If needed, `const` and `&` can be explicity added

---

<!-- .slide: data-background-image="01_auto/whats_init.gif" data-background-size="contain" -->

---

## Forces initialization

instead of

```cpp
///hide
int main() {
///unhide
int i;
///hide
}
```

write

```cpp
///hide
int main() {
///unhide
auto i = 42;    // guaranteed to be initialized
///hide
}
```

Note: solving the first problem

---

## Avoid narrowing conversions

instead of

```cpp
///hide
#include <string>
#include <vector>

int main() {
///unhide
std::vector<std::string> v;
int size = v.size();
///hide
}
```

write

```cpp
///hide
#include <string>
#include <vector>

int main() {
std::vector<std::string> v;
///unhide
auto size = v.size(); // exact type, no narrowing
///hide
}
```

Note: solving narrowing conversions

---

## DRY initialization syntax

instead of

```cpp
///hide
#include <vector>

int main() {
///unhide
std::vector<int> v2 = std::vector<int>(5);
///hide
}
```

write

```cpp
///hide
#include <vector>

int main() {
///unhide
auto v2 = std::vector<int>(5); // keep it DRY
///hide
}
```

Note: if one wants to use explicit constructor with the assignment syntax they would have to repeat the type but not with auto 

---

## Correct type by default

instead of

```cpp
///hide
#include <vector>

void foo(std::vector<int> &v) {
///unhide
std::vector<int>::const_iterator i = v.begin();
///hide
}
```

write

```cpp
///hide
#include <vector>

void foo(std::vector<int> &v) {
///unhide
auto i = begin(v);
///hide
}
```

Note: 
- correct and clear and simpler
- stays correct if we change the type of the parameter to be non-const
- or even replace vector with some other type of container

---

## Avoids hidden temporaries

instead of

```cpp
///hide
#include <iostream>

struct gadget{
    gadget() { std::cout << "gadget()\n"; }
    gadget(const gadget&) { std::cout << "gadget(gadget&)\n"; }
};

struct widget{
    widget() { std::cout << "widget()\n"; }
    widget(const gadget&) { std::cout << "widget(gadget&)\n"; }
};

gadget get_gadget() {
    return gadget();
}

int main() {
///unhide
widget w = get_gadget();
///hide
}
```

write

```cpp
///hide
#include <iostream>

struct gadget{
    gadget() { std::cout << "gadget()\n"; }
    gadget(const gadget&) { std::cout << "gadget(gadget&)\n"; }
};

struct widget{
    widget() { std::cout << "widget()\n"; }
    widget(const gadget&) { std::cout << "widget(gadget&)\n"; }
};

gadget get_gadget() {
    return gadget();
}

int main() {
///unhide
auto w = get_gadget(); // gadget can be used
///hide
}
```

or

```cpp
///hide
#include <iostream>

struct gadget{
    gadget() { std::cout << "gadget()\n"; }
    gadget(const gadget&) { std::cout << "gadget(gadget&)\n"; }
};

struct widget{
    widget() { std::cout << "widget()\n"; }
    widget(const gadget&) { std::cout << "widget(gadget&)\n"; }
};

gadget get_gadget() {
    return gadget();
}

int main() {
///unhide
auto w = widget(get_gadget()); // widget is needed
///hide
}
```

---

<!-- .slide: class="aside" -->

## `static_assert`

Check assertions at compile time:
```cpp
///hide
constexpr auto bool_constexpr = true;
#define message "should never appear"
///unhide
static_assert ( bool_constexpr , message );
```

For example:
```cpp
static_assert(sizeof(void *) == 8, 
  "Only 64-bit code generation is supported.");
```

Note:
- If you only support 64 bit you can give a compile time error if anyone tries to use you code to compile for other architectures
- Open CE

---

<!-- .slide: class="aside" -->

## `decltype`

Similar to `sizeof(expr)` but returns type instead of size.

```cpp
#include <type_traits>

int f();

static_assert(sizeof(f()) == sizeof(int), 
  "f should return int");
static_assert(std::is_same<int, decltype(f())>::value, 
  "f should return int");
```

---

## what should be the return type

```cpp
///hide
#include <iostream>
#define RETURN_TYPE auto

///unhide
template <typename Func, typename T>
RETURN_TYPE trace(Func f, T t) { 
  std::cout << "Calling f on " << t;
  return f(t); 
}
```

Note: we implement a generic tracing function which gets a function `f` and a value `t` and returns the result of `f(t)`.

---

## what should be the return type

first try

```cpp
///fails='t' was not declared in this scope
///hide
#include <iostream>

///unhide
template <typename Func, typename T>
decltype(f(t)) trace(Func f, T t) { 
  std::cout << "Calling f on " << t;
  return f(t); 
}
```

Note: 
- open CE
- to express the return type we need to refer to `f` and `t` which are unknown to the compiler at the point of defining the return type.

---

## trailing return type

```cpp
///hide
#include<iostream>
///unhide
template <typename Func, typename T>
auto trace(Func f, T t) -> decltype(f(t)) { 
  std::cout << "Calling f on " << t;
  return f(t); 
}
```

Note: we replace the return type with `auto` and add the actual return type after the arrow.
At this point we can refer to `f` and `t`.

---

## `auto` return type (C++14)

```cpp
///hide
#include<iostream>
///unhide
template <typename Func, typename T>
auto trace(Func f, T t) { 
  std::cout << "Calling f on " << t;
  return f(t); 
}
```

Note: in c++14, this idiom was shortened to mean deduce the return type from the return statement

---

<!-- .slide: data-background="concerned.gif" -->

# CONCERNED?
<!-- .element: style="text-shadow: 3px 3px black; color: lightblue" -->

Note:
- There are number of popular concerns about using auto.
- Let's tackle some of them.

---

> writing auto to declare a variable is primarily about saving typing.

---

Writing auto is about

- [x] correctness <!-- .element: class="fragment" -->
- [x] performance <!-- .element: class="fragment" -->
- [x] maintainability <!-- .element: class="fragment" -->
- [x] robustness <!-- .element: class="fragment" -->
- [x] convenience <!-- .element: class="fragment" -->

Note:
No, writing auto is about
- correctness
- performance
- maintainability
- robustness
- AND FINALLY, ALSO
- convenience

Next...

---

> But in some cases I do want to commit to a specific type, not automatically deduce it, so I can’t use auto.

---

Use

```cpp
///hide
template<typename type>
void foo(type init) {
///unhide
auto x = type(init);
///hide
}
```

Note: WRONG!

---

> My code gets unreadable quickly when I don’t know what exact type my variable is without hunting around to see what that function or expression returns, so I can’t just use auto all the time.

---

How many concrete types are in this function?

```cpp
///hide
#include <algorithm>
#include <cassert>

using namespace std;
///unhide
template<class Container, class Value>
void append_unique( Container& c, const Value& v ) {
    if( find(begin(c), end(c), v) == end(c) )
        c.push_back(v); 
    assert( !c.empty() );
}
```

Note: 
the lack of exact types makes it much more powerful and doesn’t significantly harm its readability

---

## write code against interfaces, not implementations

- <!-- .element: class="fragment" -->  Functions - hiding code
- <!-- .element: class="fragment" -->  OO - hiding code and data
- <!-- .element: class="fragment" --> Polymorphism - hiding type

Note: 
- we write functions to hide implmenetation code
- we write class to hide private members and methods
- we use static (templates) and dynamic (virtual methods) polymorphism to write generic code
- using `auto` is another link in this software development chain

---

## Using `auto`

- <!-- .element: class="fragment" --> guarantees the variable will be initialized
- <!-- .element: class="fragment" --> efficient by default
- <!-- .element: class="fragment" --> guarantees that you will use the correct exact type
- <!-- .element: class="fragment" --> guarantees that you will continue to use the correct exact type
- <!-- .element: class="fragment" --> is the only good option for hard-to-spell and impossible-to-spell types
- <!-- .element: class="fragment" --> is just generally simpler and less typing

---

# Thank you