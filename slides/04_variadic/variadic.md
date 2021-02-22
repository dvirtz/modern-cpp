<!-- .slide: data-background-image="bruce.jpg" -->

---

## from Boost::Thread library

```cpp
///libs=boost:173
///hide
#include <boost/thread/pthread/thread_data.hpp>
#include <boost/thread/detail/is_convertible.hpp>
#include <boost/bind.hpp>
///unhide
namespace boost {

class thread {
///hide
  boost::detail::thread_data_ptr thread_info;
  struct dummy;
  void start_thread();

///unhide
  template <class F,class A1>
  thread(F f,A1 a1,
         typename disable_if<boost::thread_detail::is_convertible<F&,thread_attributes >, dummy* >::type=0):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1)))
  {
      start_thread();
  }
  template <class F,class A1,class A2>
  thread(F f,A1 a1,A2 a2):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3>
  thread(F f,A1 a1,A2 a2,A3 a3):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4,class A5>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4,A5 a5):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4,a5)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4,class A5,class A6>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4,A5 a5,A6 a6):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4,a5,a6)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4,class A5,class A6,class A7>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4,A5 a5,A6 a6,A7 a7):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4,a5,a6,a7)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4,class A5,class A6,class A7,class A8>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4,A5 a5,A6 a6,A7 a7,A8 a8):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4,a5,a6,a7,a8)))
  {
      start_thread();
  }

  template <class F,class A1,class A2,class A3,class A4,class A5,class A6,class A7,class A8,class A9>
  thread(F f,A1 a1,A2 a2,A3 a3,A4 a4,A5 a5,A6 a6,A7 a7,A8 a8,A9 a9):
      thread_info(make_thread_info(boost::bind(boost::type<void>(),f,a1,a2,a3,a4,a5,a6,a7,a8,a9)))
  {
      start_thread();
  }
};

} // namespace boost
```

<!-- .element: style="font-size:0.3em" -->

---

## common `printf` bug

```cpp
///compiler=g75
#include <cstdio>
#include <string>

std::string getName() {
  return "Dvir";
}

///hide
int main() {

///unhide
printf("Hello %s", getName());
///hide

}
```

---

<!-- .slide: id="variadic_templates" data-background-image="smith.gif" -->

## Variadic templates

<!-- .element: class="chapter bottom"  -->

<div class="footnote">

Sources:
- [N2080](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2006/n2080.pdf)
- [cppreference](https://en.cppreference.com/w/cpp/language/parameter_pack)
- [Fluent{C++}](https://www.fluentcpp.com/2019/02/05/how-to-define-a-variadic-number-of-arguments-of-the-same-type-part-3/)

<div>

<!-- .element: style="text-shadow: 3px 3px black; color: lightblue; position: fixed; bottom: 0" -->

---

## variadic type

<div class="r-stack">

```cpp
template<typename... Args> struct count;
```

<div class="fragment highlight bottom" style="background-color:#d7d7d747; height:5em; width:9.5em; top: 1em; left: -8.2em">
parameter pack
</div>

</div>

---

## base specialization

```cpp
///hide
#include <cstddef>
template<typename... Args> struct count;
///unhide
template<>
struct count<> {
  static const size_t value = 0;
};
```

---

## recursive case

<div class="r-stack">

```cpp
///hide
#include <cstddef>
template<typename... Args> struct count;
///unhide
template<typename T, typename... Args>
struct count<T, Args...>
{
  static const size_t value = 1 + count<Args...>::value;
};
```

<div class="fragment highlight bottom" style="background-color:#d7d7d747; height: 5em; width: 4.3em; top: 2.5em; left: 7.2em">
pack expansion
</div>

</div>

---

## check

```cpp [14-15]
///hide
#include <cstddef>
///unhide
template<typename... Args> struct count;

template<>
struct count<> {
  static const size_t value = 0;
};

template<typename T, typename... Args>
struct count<T, Args...>
{
  static const size_t value = 1 + count<Args...>::value;
};

static_assert(count<int, int, double>::value == 3, 
              "3 elements");
```

<!-- .element: style="font-size: 0.5em" -->

---

## `sizeof...`

```cpp
///hide
#include <cstddef>

///unhide
template<typename... Args> struct count 
{
  static const size_t value = sizeof...(Args);
};

static_assert(count<int, int, double>::value == 3, 
              "3 elements");
```

Note: Args is not expanded

---

## type safe `printf`

<!-- .element data-id="title" -->

```cpp []
///hide
#include <iostream>

///unhide
template<typename T, typename... Args>
void tprintf(const char* format, T value, Args... args)
{
    for ( ; *format != '\0'; format++ ) {
        if ( *format == '%' ) {
           std::cout << value;
           tprintf(format+1, args...); // recursive call
           return;
        }
        std::cout << *format;
    }
}
```

<!-- .element: style="font-size:0.45em" data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## with recursion base

<!-- .element data-id="title" -->

```cpp []
///hide
#include <iostream>

///unhide
void tprintf(const char* format) { std::cout << format; }

template<typename T, typename... Args>
void tprintf(const char* format, T value, Args... args)
{
    for ( ; *format != '\0'; format++ ) {
        if ( *format == '%' ) {
           std::cout << value;
           tprintf(format+1, args...); // recursive call
           return;
        }
        std::cout << *format;
    }
}
```

<!-- .element: style="font-size:0.45em" data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## without copy

<!-- .element data-id="title" -->

```cpp []
///hide
#include <iostream>

///unhide
void tprintf(const char* format) { std::cout << format; }

template<typename T, typename... Args>
void tprintf(const char* format, T value, const Args&... args)
{
    for ( ; *format != '\0'; format++ ) {
        if ( *format == '%' ) {
           std::cout << value;
           tprintf(format+1, args...); // recursive call
           return;
        }
        std::cout << *format;
    }
}
```

<!-- .element: style="font-size:0.45em" data-id="code" -->

---

## compiler generated "recursion"

```cpp
///hide
#include <iostream>

void tprintf(const char* format)
{
    std::cout << format;
}

template<typename T, typename... Args>
void tprintf(const char* format, T value, const Args&... args)
{
    for ( ; *format != '\0'; format++ ) {
        if ( *format == '%' ) {
           std::cout << value;
           tprintf(format+1, args...); // recursive call
           return;
        }
        std::cout << *format;
    }
}

///unhide
int main() {
  tprintf("% world% %\n", "Hello", '!', 123);

  // compiler generates
  // tprintf("% world% %\n", "Hello", '!', 123);
  // tprintf(" world% %\n", '!', 123);
  // tprintf(" %\n", 123);
  // tprintf("\n");
}
```

---

## new `boost::thread`

```cpp
///libs=boost:173
///hide
#include <boost/thread/pthread/thread_data.hpp>
#include <boost/thread/detail/is_convertible.hpp>
#include <boost/bind.hpp>
///unhide
namespace boost {

class thread {
///hide
  boost::detail::thread_data_ptr thread_info;
  struct dummy;
  void start_thread();

///unhide
  template <class F, class Arg, class ...Args>
  thread(F&& f, Arg&& arg, Args&&... args) :
    thread_info(make_thread_info(
      thread_detail::decay_copy(boost::forward<F>(f)),
      thread_detail::decay_copy(boost::forward<Arg>(arg)),
      thread_detail::decay_copy(boost::forward<Args>(args))...)
    )
  {
    start_thread();
  }
};

} // namespace boost
```

<!-- .element: style="font-size: 0.45em" -->

---

## more pack expansions

```cpp [1|2|3|4-7|8-9]
///hide
template<typename... Args> void f(Args...);
template<typename... Args> void h(Args...);
template<typename... Args>
void foo(Args... args) {
auto n = 0;
///unhide
f(&args...); // f(&E1, &E2, &E3)
f(n, ++args...); // f(n, ++E1, ++E2, ++E3);
f(++args..., n); // f(++E1, ++E2, ++E3, n);
f(const_cast<const Args*>(&args)...);
// f(const_cast<const E1*>(&X1), 
//   const_cast<const E2*>(&X2), 
//   const_cast<const E3*>(&X3))
f(h(args...) + args...);
// f(h(E1,E2,E3) + E1, h(E1,E2,E3) + E2, h(E1,E2,E3) + E3)
///hide
}
```

Note: last is nested

---

## non-type template parameter pack

```cpp
template<typename... Ts, int... N>
void g(Ts (&...arr)[N]) {}

///hide
int main() {
///unhide
int n[1];
g("a", n); // Ts (&...arr)[N] expands to 
           // const char (&)[2], int(&)[1]
///hide
}
```

---

## Base specifiers and member initializer lists

```cpp
template<class... Mixins>
class X : public Mixins... {
 public:
    X(const Mixins&... mixins) : Mixins(mixins)... { }
};
```

---

<!-- .slide: id="tuple" -->

## `std::tuple`

a variadic pair

```cpp
template< class... Types >
class tuple;
```

---

<!-- .slide: data-auto-animate -->

## return multiple values

```cpp [|1|3|9-13]
///hide
#include <tuple>
#include <string>
#include <iostream>

///unhide
std::tuple<double, char, std::string> get_student(int id)
{
    if (id == 0) return std::make_tuple(3.8, 'A', "Lisa Simpson");
    if (id == 1) return std::make_tuple(2.9, 'C', "Milhouse Van Houten");
    if (id == 2) return std::make_tuple(1.7, 'D', "Ralph Wiggum");
    throw std::invalid_argument("id");
}

///hide
int main() {
///unhide
auto student0 = get_student(0);
std::cout << "ID: 0, "
          << "GPA: " << std::get<0>(student0) << ", "
          << "grade: " << std::get<1>(student0) << ", "
          << "name: " << std::get<2>(student0) << '\n';
///hide
}
```

<!-- .element: data-id="code" style="font-size:0.44em" -->

---

<!-- .slide: data-auto-animate -->

## `std::tie`

```cpp [9-16]
///hide
#include <tuple>
#include <string>
#include <iostream>

///unhide
std::tuple<double, char, std::string> get_student(int id)
{
    if (id == 0) return std::make_tuple(3.8, 'A', "Lisa Simpson");
    if (id == 1) return std::make_tuple(2.9, 'C', "Milhouse Van Houten");
    if (id == 2) return std::make_tuple(1.7, 'D', "Ralph Wiggum");
    throw std::invalid_argument("id");
}

///hide
int main() {
///unhide
double gpa1;
char grade1;
std::string name1;
std::tie(gpa1, grade1, name1) = get_student(1);
std::cout << "ID: 1, "
          << "GPA: " << gpa1 << ", "
          << "grade: " << grade1 << ", "
          << "name: " << name1 << '\n';
///hide
}
```

<!-- .element: data-id="code" style="font-size:0.44em" -->

Note: creates a tuple of references

---

## `std::ignore`

```cpp [|3]
///hide
#include <iostream>
#include <string>
#include <set>
#include <tuple>
 
int main()
{
///unhide
std::set<std::string> set_of_str;
bool inserted = false;
std::tie(std::ignore, inserted) = set_of_str.insert("Test");
if (inserted) {
    std::cout << "Value was inserted successfully\n";
}
///hide
}
```

<!-- .element: style="font-size:0.5em" -->

---

## avoiding recursion

```cpp
///hide
#include <cassert>
///unhide
int sum() {
  return 0;
}

template<typename T, typename... Args>
int sum(const T& t, const Args&... args)
{
  return t + sum(args...);
}

///hide
int main() {
///unhide
assert(sum(1, 2, 3) == 6);
///hide
}
```

---

## `std::initializer_list` for the rescue

```cpp
///hide
#include <cassert>
#include <initializer_list>

///unhide
template<typename... Args>
int sum(const Args&... args)
{
  auto res = 0;
  (void)std::initializer_list<int>{(res += args, 0)...};
  return res;
}

///hide
int main() {
///unhide
assert(sum(1, 2, 3) == 6);
///hide
}
```

Note: C++17 has fold expressions

---

<!-- .slide: data-background-image="same.gif" -->

# variadic arguments of the same type

<!-- .element: class="r-stretch" style="display: flex; align-items: flex-end; text-shadow: 3px 3px black; color: lightblue" -->

---

## Solution #1 

`std::initializer_list`

```cpp
///hide
#include <cassert>
#include <initializer_list>

///unhide
int sum(std::initializer_list<int> ints);

///hide
void foo() {
///unhide
assert(sum({1, 2, 3}) == 6);
// sum({1, 2, "3"}); // fails to compile
///hide
}
```

---

<!-- .slide: id="conjunction" -->

```cpp
#include <type_traits>

template<class...> struct conjunction : std::true_type { };

template<class B1> struct conjunction<B1> : B1 { };

template<class B1, class... Bn>
struct conjunction<B1, Bn...> 
    : std::conditional<bool(B1::value), conjunction<Bn...>, B1>::type {};
```

<!-- .element: style="font-size: 0.45em" -->

Note: in the standard from C++17

---

## Solution #2

`static_assert`

```cpp
///hide
#include <type_traits>
#include <cassert>

template<class...> struct conjunction : std::true_type { };
template<class B1> struct conjunction<B1> : B1 { };
template<class B1, class... Bn>
struct conjunction<B1, Bn...> 
    : std::conditional<bool(B1::value), conjunction<Bn...>, B1>::type {};
///unhide

template<typename... Args>
int sum(const Args&... args) {
  static_assert(conjunction<std::is_same<Args, int>...>::value, 
                "all arguments should be int");
}

///hide
void foo() {
///unhide
assert(sum(1, 2, 3) == 6);
// sum(1, 2, "3"); // fails to compile
///hide
}
```

---

<!-- .slide: class="aside" -->

## SFINAE

"Substitution Failure Is Not An Error"

```cpp [|2,9|5,9]
template<typename T>
void f(T x, typename T::type y);
 
template<typename T>
void f(T x, typename T::other_type y);

struct A
{
    using type = int;
};

///hide
void foo() {
///unhide
f(A(), 42);
///hide
}
```

---

`std::enable_if`

```cpp
template<bool B, class T = void>
struct enable_if {};
 
template<class T>
struct enable_if<true, T> { 
  typedef T type; 
};
```

---

## Solution #3

SFINAE

```cpp
///hide
#include <type_traits>
#include <cassert>

template<class...> struct conjunction : std::true_type { };
template<class B1> struct conjunction<B1> : B1 { };
template<class B1, class... Bn>
struct conjunction<B1, Bn...> 
    : std::conditional<bool(B1::value), conjunction<Bn...>, B1>::type {};

///unhide
template<typename... Ts>
using AllInts = typename std::enable_if<
  conjunction<std::is_same<Ts, int>...>::value
  >::type;


template<typename... Args, typename = AllInts<Args...>>
int sum(const Args&... args);

///hide
void foo() {
///unhide
assert(sum(1, 2, 3) == 6);
// sum(1, 2, "3"); // fails to compile
///hide
}
```

---

<!-- .slide: data-background-image="matrix_thanks.gif" -->