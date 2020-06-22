<!-- .slide: data-background-image="03_initialization/irwin.jpeg" -->

---

Take a look at the following code:

<div class="container">

```cpp [|4-6,8-10|1|8,16]
///options=-std=c++03
struct POD { int i; float f; };

class C {
  POD p;
  int iarr[3];
  double d;
public:
  C() : d(3.14) {
    p.i=2; p.f=22.34;
    for (unsigned i = 0; i < 3; ++i) iarr[i] = i;
  }
};

class D {
public:
  D(C const&, POD const&) {}
};
///hide
int main() {
  C c(); 
  D d(C(), POD());
  POD* pp = new POD();
  pp->i = 4;
  pp->f = 22.1;
  float* pf = new float[2];
  pf[0] = 1.2f;
  pf[1] = 2.3f;
}
```

```cpp 18[|0|21-26|19-20]
///hide
///options=-std=c++03
struct POD { int i; float f; };

class C {
  POD p;
  int iarr[3];
  double d;
public:
  C() : d(3.14) {
    p.i=2; p.f=22.34;
    for (unsigned i = 0; i < 3; ++i) iarr[i] = i;
  }
};

class D {
public:
  D(C const&, POD const&) {}
};
///unhide
int main() {
  C c(); 
  D d(C(), POD());
  POD* pp = new POD();
  pp->i = 4;
  pp->f = 22.1;
  float* pf = new float[2];
  pf[0] = 1.2f;
  pf[1] = 2.3f;
}
```

</div>

---

## Most vexing parse

```cpp
///fails
C c();            // c: () => C
D d(C(), POD());  // d: (() => C, () => POD) => D
```

---

<!-- .slide: data-auto-animate -->

## Different initialization syntax

```cpp []
///hide
int v = 7;
typedef int X;
///unhide
X t1 = v;     // copy initialization
X t2(v);      // direct initialization
X t3 = { v }; // initialize using initializer list
X t4 = X(v);  // make an X from v and copy it to t4
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## Different initialization syntax

```cpp []
int v = 7;
typedef int X;
X t1 = v;     // ok
X t2(v);      // ok
X t3 = { v }; // ok
X t4 = X(v);  // ok
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## Different initialization syntax

```cpp []
///fails
int v = 7;
typedef struct { int x; int y; } X;
X t1 = v;     // error
X t2(v);      // error
X t3 = { v }; // ok: X is an aggregate
X t4 = X(v);  // error: we can’t cast an int to a struct
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## Different initialization syntax

```cpp []
///fails
///hide
#include <vector>
///unhide
int v = 7;
typedef std::vector<int> X;
X t1 = v;     // error: constructor is explicit
X t2(v);      // ok
X t3 = { v }; // error: not an aggregate
X t4 = X(v);  // ok (make an X from v and copy it to t4)
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## Different initialization syntax

```cpp []
///fails
int v = 7;
typedef int* X;
X t1 = v;     // error
X t2(v);      // error
X t3 = { v }; // error
X t4 = X(v);  // ok: unfortunately converts int to an int*
```

<!-- .element: data-id="code" -->

---

## More initialization

```cpp
///hide
struct X {
    X(int);
};
struct Y : X {
    Y(int);
    int m;
};

int v;

void f1() {
///unhide
X(42);                      // create a temporary
///hide
}
///unhide
X f(int v) { return v; }    // return a value
///hide
void f2() {
///unhide
void g(X); g(v);            // pass an argument
new X(v);                   // create object on free store
///hide
}
///unhide
Y::Y(int v) :X(v), m(v) {}  // base and member initializers
///hide
void f3() {
///unhide
throw v;                    // throw an exception 
///hide
}
```

---

<!-- .slide: data-background-image="03_initialization/list.gif" -->

# List Initialization

<!-- .element: class="r-stretch" style="display: flex; align-items: flex-end; text-shadow: 3px 3px black; color: lightblue" -->

<div style="display: flex; text-shadow: 3px 3px black; color: lightblue">
<small>

Sources:
- [simplify C++](https://arne-mertz.de/2015/07/new-c-features-uniform-initialization-and-initializer_list/)
- [N2215](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2007/n2215.pdf)

<small>
<div>

---

## Initialize (almost) anything with `{}`

```cpp
///hide
struct X {
    X(int);
};
struct Y : X {
    Y(int);
    int m;
};

int v;

void f1() {
///unhide
X{42};                      // create a temporary
///hide
}
///unhide
X f(int v) { return {v}; }  // return a value
///hide
void f2() {
///unhide
void g(X); g({v});          // pass an argument
new X{v};                   // create object on free store
///hide
}
///unhide
Y::Y(int v) :X{v}, m{v} {}  // base and member initializers
```

This is still forbidden:

```cpp
///fails
///hide
void f3() {
int v = 42;
///unhide
throw {v};                  // throw an exception 
///hide
}
```

---

# It's also safer

```cpp
///fails
int i1(4.2); // no problem
int i2{4.2}; // error: narrowing conversion

double d;
float f1(d); // no problem
float f2{d}; // error: narrowing conversion

float f3(i1); // no problem
float f4{i1}; // error: narrowing conversion

unsigned int ui1(-1); // no problem
unsigned int ui2{-1}; // error: narrowing conversion
```

---

## Now, with list initialization

```cpp [8,17-20]
struct POD { int i; float f; };

class C {
  POD p;
  int iarr[3];
  double d;
public:
  C() : p{2, 22.34}, iarr{0, 1, 2}, d{3.14} {}
};

class D {
public:
  D(C const&, POD const&) {}
};

int main() {
  C c{}; 
  D d{C(), POD()};
  POD* pp = new POD{4, 22.1};
  float* pf = new float[2]{1.2f, 2.3f};
}
```

<!-- .element: style="font-size: 0.3em" -->

---

## Creating an array

```cpp
///options=-std=c++03
///hide
#include <string>

int main(){
///unhide
std::string days[] = { 
  "Sunday", 
  "Monday", 
  "Tuesday", 
  "Wednesday", 
  "Thursday", 
  "Friday", 
  "Saturday" 
};
///hide
}
```

---

## Creating a vector

```cpp
///options=-std=c++03
///hide
#include <string>
#include <vector>

int main(){
///unhide
std::vector<std::string> days;
days.reserve(7);

days.push_back("Sunday"); 
days.push_back("Monday"); 
days.push_back("Tuesday"); 
days.push_back("Wednesday"); 
days.push_back("Thursday"); 
days.push_back("Friday"); 
days.push_back("Saturday");
///hide
}
```

---

### `std::initializer_list<T>`

- A lightweight proxy object that provides access to an array of objects of type const T.
- Custructed automatically by the compiler when 
  - calling a constructor/function accepting `std::initializer_list`
  - binding a `braced-init-list` to auto

---

## Example

<div class="container">

```cpp [|4|10]
///hide
#include <vector>
#include <iostream>
///unhide
template <class T>
struct S {
    std::vector<T> v;
    S(std::initializer_list<T> l) : v(l) {
         std::cout 
          << "constructed with a " 
          << l.size() 
          << "-element list\n";
    }
    void append(std::initializer_list<T> l) {
        v.insert(end(v), begin(l), end(l));
    }
};
///hide
int main() {
  S<int> s = {1, 2, 3, 4, 5};
  s.append({6, 7, 8});
}
```

```cpp 14[|15|16]
///hide
#include <vector>
#include <iostream>
template <class T>
struct S {
    std::vector<T> v;
    S(std::initializer_list<T> l) : v(l) {
         std::cout 
          << "constructed with a " 
          << l.size() 
          << "-element list\n";
    }
    void append(std::initializer_list<T> l) {
        v.insert(end(v), begin(l), end(l));
    }
};
///unhide
int main() {
  S<int> s = {1, 2, 3, 4, 5};
  s.append({6, 7, 8});
}
```

</div>

---

## and

```cpp
///hide
#include <string>
#include <vector>

int main(){
///unhide
std::vector<std::string> days { 
  "Sunday", 
  "Monday", 
  "Tuesday", 
  "Wednesday", 
  "Thursday", 
  "Friday", 
  "Saturday" 
};
///hide
}
```

---

## or even

```cpp
///hide
#include <map>
#include <string>

int main() {
std::string s1;
///unhide
std::map<int, std::string> m = {
        {1, "a"},
        {2, {'a', 'b', 'c'} },
        {3, s1}
};
///hide
}

---

## `initializer_list` constructor is prefered

```cpp
///execute
///hide
#include <vector>
#include <cassert>

int main() {
///unhide
std::vector<int> aDozenOfFives(12, 5);
std::vector<int> twelveAndFive{12, 5};
assert(aDozenOfFives != twelveAndFive);
///hide
}
///
```

---

<!-- .slide: class="aside" -->

## Range-based for loop

Instead of

```cpp [2-4]
///hide
#include <vector>
#include <iostream>
///unhide
void print(const std::vector<int>& v){
  for (auto it = begin(v); it != end(v); ++it) {
    std::cout << *it << ' ';
  }
  std::cout << '\n';
}
```

write

```cpp [2-4]
///hide
#include <vector>
#include <iostream>
///unhide
void print(const std::vector<int>& v){
  for (const auto& i: v) {
    std::cout << i << ' ';
  }
  std::cout << '\n';
}
```

---

## with `std::initializer_list`

```cpp
///hide
#include <iostream>
int main(){
///unhide
for (auto x : {-1, -2, -3})
  std::cout << x << ' ';
std::cout << '\n';
///hide
}
```

---

## Note

```cpp [7-13]
///hide
#include <initializer_list>
#include <type_traits>

///unhide
template<typename Expected, typename Actual>
void hasType(const Actual &) {
  static_assert(std::is_same<Actual, Expected>::value,
                "should be the same");
}

///hide
int main() {
///unhide
int i1{42};
auto i2{42};
hasType<int>(i2);

int i3 = {42};
auto i4 = {42};
hasType<std::initializer_list<int>>(i4);
///hide
}
```

Note: 
This initialization syntax is frequently referred to as "Uniform initialization". For these reasons, it is not always advised to use this syntax.

---

## note

a *braced-init-list* does not have a type in itself:

```cpp
///fails
template <typename T>
void do_sth(T t);

///hide
int main() {
///unhide
do_sth({1, 2, 3, 4, 5}); // error: couldn't infer template argument
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## note

Does not support moves

<div class="container">

```cpp
///execute
///hide
#include <vector>
#include <iostream>

///unhide
struct S {
  S() { std::cout << "default\n"; }
  S(const S&) { std::cout << "copy\n"; }
  S(S&&) { std::cout << "move\n"; }
};

///hide
int main() {
///unhide
std::vector<S> v{S(), S(), S()};
///hide
}
```

```cpp
///fails
///hide
#include <vector>
#include <iostream>

///unhide
struct S {
  S() { std::cout << "default\n"; }
  S(const S&) = delete;
  S(S&&) { std::cout << "move\n"; }
};

///hide
int main() {
///unhide
std::vector<S> v{S(), S(), S()}; // error
///hide
}
```

</div>

---

<!-- .slide: data-background-image="03_initialization/aladin_thanks.gif" data-background-size="contain" -->