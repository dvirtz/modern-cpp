## What is the problem with this code?

```cpp
///hide
#include <string>
#include <vector>

int main() {
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

---

## And this?

```cpp
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

---

## And this?

```cpp
///execute
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

---

# auto

- oldest feature in C++11 (1983)
- most commonly used

 Slides are based on <!-- .element: class="footnote" -->  [Herb Sutter's](herbsutter.com) GOTW series

---

## declaring a local variable
```cpp
///hide
void foo(int its_initial_value){
///unhide
auto my_new_variable = its_initial_value;
///hide
}
```

deduce the type from the expression used to initialize the new variable

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
const auto& d   = val; // The type of a is const int&
///hide
}
```

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

---

## Correct type by default

instead of

```cpp
///hide
#include <vector>

void foo(std::vector &v) {
///unhide
std::vector<int>::const_iterator i = v.begin();
///hide
}
```

write

```cpp
///hide
#include <vector>

void foo(std::vector &v) {
///unhide
auto i = v.begin();
///hide
}
```

Note: 
- correct and clear and simpler
- stays correct if we change the type of the parameter to be non-const
- or even pass some other type of container

---

## Cheeper

instead of

```cpp
///execute
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
}
```

write

```cpp
///execute
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
auto w = get_gadget();
///hide
}
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

---

## `static_assert`

Check assertions at compile time:
```cpp
static_assert ( bool_constexpr , message )
```

For example:
```cpp
static_assert(sizeof(void *) == 4, 
  "64-bit code generation is not supported.");
```

---

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

---

## `auto` return type (C++14)

```cpp
auto max(int& a, int& b) { 
  return a < b ? b : a;
}
```

---

## `decltype(auto)` (C++14)

```cpp
decltype(auto) max(int& a, int& b) { 
  return a < b ? b : a;
}
```

---

<!-- .slide: data-background="https://media.giphy.com/media/GPn300EibJ2F2/giphy.gif" -->

# CONCERNED?

---

> writing auto to declare a variable is primarily about saving typing.

---

Writing auto is about

- [x] correctness <!-- .element: class="fragment" -->
- [x] performance <!-- .element: class="fragment" -->
- [x] maintainability <!-- .element: class="fragment" -->
- [x] robustness <!-- .element: class="fragment" -->
- [x] convenience <!-- .element: class="fragment" -->

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

---

## write code against interfaces, not implementations

- functions - hiding code
- OOO - hiding code and data
- Polymorphism - hiding type

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