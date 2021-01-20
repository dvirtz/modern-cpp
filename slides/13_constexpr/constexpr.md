<!-- .slide: data-background-image="13_constexpr/park.png" -->

---

## constant expression

> an expression that can be evaluated at compile time.

---

## local

```cpp
///hide
int main() {
///unhide
const int BOUNDS = 42;
int arr[BOUNDS];
///hide
}
```

---

## member

```cpp
///hide
#include <climits>

///unhide
struct S{
  static const int BIT_WIDTH = 7;
  int data    : BIT_WIDTH;
  int padding : (sizeof(int) * CHAR_BIT - BIT_WIDTH);
};
```

---

<!-- .slide: data-auto-animate -->

## C 
## numeric limits

```cpp
///options+=-std=c++03
#include <climits>

enum Range {
    MIN = 0,
    MAX = INT_MAX
};
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## C++ 
## numeric limits

```cpp
///options+=-std=c++03
///fails='std::numeric_limits<int>::max()' cannot appear in a constant-expression
#include <limits>

enum Range {
    MIN = 0,
    MAX = std::numeric_limits<int>::max()
}
```

<!-- .element: data-id="code" -->

---

## flags

```cpp
///options+=-std=c++98
///fails=calls to overloaded operators cannot appear in a constant-expression
enum fmtflags {
  left  = 1 << 0,
  right = 1 << 1
};

inline fmtflags
operator|(fmtflags a, fmtflags b) { 
  return fmtflags(int(a) | int(b)); 
}

enum extendedflags {
  adjust = left | right
};
```

---

<!-- .slide: data-auto-animate -->

## linear algebra

```cpp
///hide
#include <cstddef>

///unhide
template<std::size_t I>
using vector = int[I];

template<std::size_t I>
using matrix_2d = int[I * I];

template<std::size_t I>
using matrix_3d = int[I * I * I];
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## TMP

```cpp
///hide
#include <cstddef>

///unhide
template<std::size_t I, std::size_t D>
struct pow {
  static const auto value = I * pow<I, D - 1>::value;
};

template<std::size_t I>
struct pow<I, 0> {
  static const auto value = 1;
};

template<std::size_t I, std::size_t D>
using matrix = int[pow<I, D>::value];
```

<!-- .element: data-id="code" -->

---

<!-- .slide: id="constexpr" data-background-image="13_constexpr/leviosa.gif" data-background-size="contain" -->

# `constexpr`

<!-- .element: class="chapter" -->

Note: C++11 introduces a new keyword - `constexpr`, which comes obviously from constant expressions.

---

## `constexpr`

declares that it is *possible* to evaluate the value of a function or a variable at compile time.

---

## example

```cpp
constexpr int getBounds() {
  return 42;
}
int arr[getBounds()];
```

---

## format flags

```cpp
enum fmtflags {
  left  = 1 << 0,
  right = 1 << 1
};

constexpr fmtflags
operator|(fmtflags a, fmtflags b) { 
  return fmtflags(int(a) | int(b)); 
}

enum extendedflags {
  adjust = left | right
};
```

Note: implies inline

---

<!-- .slide: data-background-image="13_constexpr/c++11.gif" -->

## C++11 &nbsp; `constexpr`

<!-- .element: class="chapter bottom" -->

Source: [N2235](https://wg21.link/n2235), Gabriel Dos Reis, Bjarne Stroustrup, Jens Maurer

<!-- .element: class="footnote" -->

Note: while introduced in C+11, `constexpr` gets more and more power with each new standard.
let's first see what was available in the first stage.

---

## C++11 `constexpr` functions

- <!-- .element: class="fragment" data-fragment-index="0" --> return type must be a literal type
- <!-- .element: class="fragment" data-fragment-index="0" --> parameters must be of literal types
- <!-- .element: class="fragment" --> body must be exactly one <code>return</code> statement
- <!-- .element: class="fragment" --> any <b>evaluated</b> sub-expression must be a constant expression

Note: evaluated

---

## constant expression

does not include the following

- **undefined behavior**
- calling non `constexpr` functions
- most examinations of `this`
- lambda expressions
- most lvalue-to-rvalue conversions
- referencing uninitialized data
- conversion from `void*` to `object*`
- modification of non-local objects
- comparison with unspecified results
- `type_id` of a polymorphic class
- `dynamic_cast` / `reinterpret_cast`
- `new` / `delete`

<!-- .element: class="split" style="font-size: 0.7em" -->

Note: undefined behavior

---

## replaces TMP

```cpp
///hide
#include <cstddef>

///unhide
constexpr size_t pow(size_t I, size_t D) {
    return D == 0 ? 1 : I * pow(I, D-1);
}

template<std::size_t I, std::size_t D>
using matrix = int[pow(I, D)];
```

---

## run-time

```cpp
///hide
#include <cstddef>

///unhide
constexpr size_t pow(size_t I, size_t D) {
    return D == 0 ? 1 : I * pow(I, D-1);
}

int main(int argc, const char* argv[]) {
  return pow(argc, 2);
}
```

---

## ignores unevaluated 

```cpp [8-16]
///hide
#include <limits>
#include <stdexcept>

///unhide
namespace detail {
template <typename T>
constexpr T next(T num, T prev) {
  return (prev + num / prev) / 2;
}
}  // namespace detail

template <typename T>
constexpr T sqrt(T num, T prev = 1.0) {
  using detail::next;
  return num < 0 
    ? throw std::out_of_range("only non-negative, please")
    : std::abs(next(num, prev) - prev) < std::numeric_limits<T>::epsilon() 
      ? next(num, prev)
      : sqrt(num, next(num, prev));
}

static_assert(std::abs(sqrt(2.0f) - 1.4142135f) < std::numeric_limits<float>::epsilon(), 
              "compile time FTW!");
```

<!-- .element: style="font-size: 0.35em" -->

Note: 
- this algorithm is called the Babylonian method
- throw at compile time?
- open CE, change to negative

---

## variables

```cpp [5|1-3,6|1-3,7]
constexpr int value() {
  return 42;
}

///hide
int main() {
///unhide
constexpr double d = 42.5;
constexpr int i = value();
int j = value();
///hide
}
```

Note: for non-`constexpr` variables, the compile can choose whether to compute the initial value at compile time or run time

---

## implies const

```cpp
///fails=assignment of read-only variable 'd'
///hide
int main() {
///unhide
constexpr double d = 42.5;
d = 45.2; // error
///hide
} 
```

---

## C++11 `constexpr` constructor

- parameters must be of literal types
- no body
- must initialize all bases and members

---

<!-- .slide: data-auto-animate -->

## constructor

```cpp []
struct complex {
  constexpr complex(double r, double i) : re(r), im(i) { }
private:
  double re;
  double im;
};

constexpr complex I{0, 1};
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## member functions

```cpp []
///options+=-std=c++11
struct complex {
  constexpr complex(double r, double i) : re(r), im(i) { }
  constexpr double real() { return re; }
  constexpr double imag() { return im; }
private:
  double re;
  double im;
};

constexpr complex I{0, 1};
static_assert(I.imag() == 1, "check");
```

<!-- .element: data-id="code" -->

Note: 
- `constexpr` member function implies const 
- we can also access public members 

---

## special member functions

```cpp
///options+=-std=c++11
struct S{
  S() = default;
  S(const S&) = default;
  S(S&&) = default;
  S& operator=(const S&) = default;
  S& operator=(S&&) = default;
  ~S() = default;
};
```

Note: open C++ Insights

---

<!-- .slide: id="literal_type" -->

## literal type

either

- scalar (arithmetic, pointer, pointer to member, enumeration, or `std::nullptr_t`)
- reference
- array of literal type
- class that has all the following
  - trivial destructor
  - either
    - an aggregate
    - at least one `constexpr` constructor
  - all non-static data members and base classes are literal 
- for union, at least one member should be a literal

<!-- .element: style="font-size: 0.7em" -->

---

## in standard library

```cpp
#include <limits>

enum Range {
    MIN = 0,
    MAX = std::numeric_limits<int>::max()
};
```

---

## in standard library

- `numeric_limits`
- `bitset`
- default constructors of `unique_ptr`, `shared_ptr`, `mutex`
- `chrono::duration`
- `char_traits`
- `complex`
- `array`

Note: for types, it means at least one constructor is `constexpr`, not necessarily all member functions

---

<!-- .slide: id="relaxed_constexpr" data-background-image="13_constexpr/relaxed.gif" -->

## C++14 relaxed &nbsp; `constexpr`

<!-- .element: class="chapter bottom" -->

Source: [N3597](https://wg21.link/n3597), Richard Smith

<!-- .element: class="footnote" -->

Note: for C++14, writing `constexpr` starts to look almost like writing any C++ code.

---

<!-- .slide: data-auto-animate -->

## C++14 `constexpr` functions

can do anything!

except <!-- .element: class="fragment" -->

- `try` / `throw`
- `asm`
- `goto`
- lambda expressions
- non-literal, `static`, `thread-local` or uninitialized variables

<!-- .element: class="fragment" -->

---

## `sqrt` revisited

```cpp [1-12]
///hide
#include <limits>
#include <stdexcept>

///unhide
template <typename T>
constexpr T sqrt(T num) {
  if (num < 0) {
    throw std::out_of_range("only non-negative, please");
  }

  T prev = 1.0, next = (prev + num / prev) / 2;
  for (; 
       std::abs(next - prev) >= std::numeric_limits<T>::epsilon();
       prev = next, next = (prev + num / prev) / 2);
  return next;
}

static_assert(std::abs(sqrt(2.0f) - 1.4142135f) < std::numeric_limits<float>::epsilon(),
              "compile time FTW!");
```

<!-- .element: style="font-size: 0.35em" -->

---

## string switch

```cpp [1-9|11-14|16-25]
///hide
#include <iostream>

void shoot();
void duck();
void run();

///unhide
constexpr unsigned long hash(const char *str) {
    unsigned long hash = 5381;
    
    for (; *str; str++) {
        hash = hash * 33 + *str;
    }

    return hash;
}
 
constexpr unsigned long operator"" _sh(
  const char *s, size_t) {
    return hash(s);
}

void on_command(const std::string& cmd) {
    switch (hash(cmd.c_str())) {
        case "shoot"_sh:
            shoot();
        case "duck"_sh:
            duck();
        case "run"_sh:
            run();
    }
}




```

<!-- .element: class="split" -->

---

## special member functions

```cpp
///options+=-std=c++14
struct S{
  S() = default;
  S(const S&) = default;
  S(S&&) = default;
  S& operator=(const S&) = default;
  S& operator=(S&&) = default;
  ~S() = default;
};
```

Note: open C++ Insights

---

## in standard library

- `initializer_list`
- `forward`, &nbsp; `move`
- `pair`, &nbsp; `tuple`
- function objects (`plus`, &nbsp; `multiplies`, &nbsp; `equal_to`, &nbsp; ...)
- `chrono::time_point`
- range access (`begin`, &nbsp; `end`, &nbsp; `size`, &nbsp; ...)
- `min`, &nbsp; `max`

Note: first two algorithms

---

<!-- .slide: data-background-image="13_constexpr/containers.gif" -->

## `constexpr` &nbsp; containers and algorithms

<!-- .element: class="chapter" -->

Source: Scott Schurr, [`constexpr`: Applications](https://youtu.be/qO-9yiAOQqc), CppCon 2015

<!-- .element: class="footnote" -->

Note: with relaxed `constexpr` we can start to unleash the power of compile time calculation by having compile time containers and algorithms to operate on them

---

<!-- .slide: id="binary_literals" class="aside" -->

## binary literals and digit separators (C++14)

The following are identical
```cpp
///hide
void foo() {
int i;
///unhide
i =               4'200;
i =              0x1068;
i =              010150;
i =  0b1'0000'0110'1000;
i = 0b1'000'001'101'000;
///hide
}
```

Note: this first binary notation relates the hexadecimal one, while the second to the octal notation

---

## bit count

```cpp
///hide
#include <cstdint>
#include <cstddef>

///unhide
constexpr size_t count_set_bits(uint32_t x);
```

---

## naive

```cpp
///hide
#include <cstdint>
#include <cstddef>

///unhide
constexpr size_t count_set_bits(uint32_t x) {
  size_t result = 0;
  while (x != 0) {
    x = x & (x - 1);
    result++;
  }
  return result;
}

static_assert(count_set_bits(0x0FF00FF0) == 16, "counted");
```

---

## lookup table

```cpp
///fails=static assertion failed
///hide
#include <cstdint>
#include <cstddef>
#include <array>

///unhide
constexpr size_t count_set_bits(uint32_t x)
{
  constexpr auto bits_set = std::array<uint32_t, 256>{
    /* 0b00, 0b01, 0b10, 0b11, 0b100, 0b101, ... */
          0,    1,    1,    2,     1,     2, 
  };
  return bits_set[ x        & 255]
       + bits_set[(x >>  8) & 255]
       + bits_set[(x >> 16) & 255]
       + bits_set[(x >> 24) & 255];
}

static_assert(count_set_bits(0x0FF00FF0) == 16, "counted");
```

---

## generate lookup

```cpp [1-8|10-16]
///fails=call to non-'constexpr' function
///hide
#include <cstdint>
#include <cstddef>
#include <array>

///unhide
constexpr size_t slow_count(uint32_t x) {
  size_t result = 0;
  while (x != 0) {
    x = x & (x - 1);
    result++;
  }
  return result;
}

constexpr auto generate_bits_set() {
  std::array<uint32_t, 256> res{};
  for (size_t i = 0; i < 256; ++i) {
    res[i] = slow_count(i);
  }
  return res;
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: 
- have to init `res`
- fails because non const `std::array::operator[]` is not `constexpr` in c++14

---

## DIY

```cpp []
///hide
#include <cstddef>
#include <iterator>

///unhide
template <typename T, std::size_t N>
class constexpr_array {
public:
  using iterator = T*;

  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }

private:
  T m_data[N] {};
};
```

<!-- .element: style="font-size: 0.42em" -->

Note:
- all members initialized
- from C++14: non const `constexpr` member function

---

## now

```cpp [2,9]
///fails=call to non-'constexpr' function
///hide
#include <cstdint>
#include <iterator>

template <typename T, std::size_t N>
class constexpr_array {
public:
  using iterator = T*;

  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }

private:
  T m_data[N] {};
};

constexpr size_t slow_count(uint32_t x) {
  size_t result = 0;
  while (x != 0) {
    x = x & (x - 1);
    result++;
  }
  return result;
}

///unhide
constexpr auto generate_bits_set() {
  constexpr_array<uint32_t, 256> res{};
  for (size_t i = 0; i < 256; ++i) {
    res[i] = slow_count(i);
  }
  return res;
}

static_assert(generate_bits_set()[3] == 2, "yep");
```

---

## and

```cpp [3,10]
///fails=call to non-'constexpr' function
///hide
#include <cstdint>
#include <iterator>

template <typename T, std::size_t N>
class constexpr_array {
public:
  using iterator = T*;

  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }

private:
  T m_data[N] {};
};

constexpr size_t slow_count(uint32_t x) {
  size_t result = 0;
  while (x != 0) {
    x = x & (x - 1);
    result++;
  }
  return result;
}

constexpr auto generate_bits_set() {
  constexpr_array<uint32_t, 256> res{};
  for (size_t i = 0; i < 256; ++i) {
    res[i] = slow_count(i);
  }
  return res;
}

///unhide
constexpr size_t count_set_bits(uint32_t x)
{
  constexpr auto bits_set = generate_bits_set();
  return bits_set[ x        & 255]
       + bits_set[(x >>  8) & 255]
       + bits_set[(x >> 16) & 255]
       + bits_set[(x >> 24) & 255];
}

static_assert(count_set_bits(0x0FF00FF0) == 16, "counted");
```

<!-- .element: style="font-size: 0.5em" -->

---

## keep this list sorted

from tar source code

```cpp
///fails='OPTION_B64ENCODE' was not declared in this scope
/*
 * Long options for tar.  Please keep this list sorted.
 *
 * The symbolic names for options that lack a short equivalent are
 * defined in bsdtar.h.  Also note that so far I've found no need
 * to support optional arguments to long options.  That would be
 * a small change to the code below.
 */

static const struct bsdtar_option {
    const char *name;
    int required;      /* 1 if this option requires an argument. */
    int equivalent;    /* Equivalent short option. */
} tar_longopts[] = {
    { "absolute-paths",       0, 'P' },
    { "append",               0, 'r' },
    { "auto-compress",        0, 'a' },
    { "b64encode",            0, OPTION_B64ENCODE },
    { "block-size",           1, 'b' },
    { "bunzip2",              0, 'j' },
    { "bzip",                 0, 'j' },
    { "bzip2",                0, 'j' },
    { "cd",                   1, 'C' },
    { "check-links",          0, OPTION_CHECK_LINKS },
    { "chroot",               0, OPTION_CHROOT },
    { "compress",             0, 'Z' },
    { "confirmation",         0, 'w' },
    { "create",               0, 'c' },
    { "dereference",          0, 'L' },
    { "directory",            1, 'C' },
    { "disable-copyfile",     0, OPTION_DISABLE_COPYFILE },
    { "exclude",              1, OPTION_EXCLUDE },
    { "exclude-from",         1, 'X' },
    { "extract",              0, 'x' },
    { "fast-read",            0, 'q' },
    { "file",                 1, 'f' },
    { "files-from",           1, 'T' },
    { "format",               1, OPTION_FORMAT },
    { "gid",                  1, OPTION_GID },
    { "gname",                1, OPTION_GNAME },
    { "grzip",                0, OPTION_GRZIP },
    { "gunzip",               0, 'z' },
    { "gzip",                 0, 'z' },
    { "help",                 0, OPTION_HELP },
    { "hfsCompression",       0, OPTION_HFS_COMPRESSION },
    { "include",              1, OPTION_INCLUDE },
    { "insecure",             0, 'P' },
    { "interactive",          0, 'w' },
    { "keep-newer-files",     0, OPTION_KEEP_NEWER_FILES },
    { "keep-old-files",       0, 'k' },
    { "list",                 0, 't' },
    { "lrzip",                0, OPTION_LRZIP },
    { "lzip",                 0, OPTION_LZIP },
    { "lzma",                 0, OPTION_LZMA },
    { "lzop",                 0, OPTION_LZOP },
    { "modification-time",    0, 'm' },
    { "newer",                1, OPTION_NEWER_CTIME },
    { "newer-ctime",          1, OPTION_NEWER_CTIME },
    { "newer-ctime-than",     1, OPTION_NEWER_CTIME_THAN },
    { "newer-mtime",          1, OPTION_NEWER_MTIME },
    { "newer-mtime-than",     1, OPTION_NEWER_MTIME_THAN },
    { "newer-than",           1, OPTION_NEWER_CTIME_THAN },
    { "no-recursion",         0, 'n' },
    { "no-same-owner",        0, OPTION_NO_SAME_OWNER },
    { "no-same-permissions",  0, OPTION_NO_SAME_PERMISSIONS },
    { "nodump",               0, OPTION_NODUMP },
    { "nopreserveHFSCompression",0, OPTION_NOPRESERVE_HFS_COMPRESSION },
    { "norecurse",            0, 'n' },
    { "null",                 0, OPTION_NULL },
    { "numeric-owner",        0, OPTION_NUMERIC_OWNER },
    { "older",                1, OPTION_OLDER_CTIME },
    { "older-ctime",          1, OPTION_OLDER_CTIME },
    { "older-ctime-than",     1, OPTION_OLDER_CTIME_THAN },
    { "older-mtime",          1, OPTION_OLDER_MTIME },
    { "older-mtime-than",     1, OPTION_OLDER_MTIME_THAN },
    { "older-than",           1, OPTION_OLDER_CTIME_THAN },
    { "one-file-system",      0, OPTION_ONE_FILE_SYSTEM },
    { "options",              1, OPTION_OPTIONS },
    { "posix",                0, OPTION_POSIX },
    { "preserve-permissions", 0, 'p' },
    { "read-full-blocks",     0, 'B' },
    { "same-owner",           0, OPTION_SAME_OWNER },
    { "same-permissions",     0, 'p' },
    { "strip-components",     1, OPTION_STRIP_COMPONENTS },
    { "to-stdout",            0, 'O' },
    { "totals",               0, OPTION_TOTALS },
    { "uid",                  1, OPTION_UID },
    { "uname",                1, OPTION_UNAME },
    { "uncompress",           0, 'Z' },
    { "unlink",               0, 'U' },
    { "unlink-first",         0, 'U' },
    { "update",               0, 'u' },
    { "use-compress-program", 1, OPTION_USE_COMPRESS_PROGRAM },
    { "uuencode",             0, OPTION_UUENCODE },
    { "verbose",              0, 'v' },
    { "version",              0, OPTION_VERSION },
    { "xz",                   0, 'J' },
    { NULL, 0, 0 }
};
``` 

---

## let the compiler validate

```cpp
///hide
#include <functional>

///unhide
template<typename ForwardIt, typename Comp = std::less<>>
constexpr bool 
is_sorted(ForwardIt first, ForwardIt last, Comp comp = {}) {
  if (first != last) {
    auto next = first;
    while (++next != last) {
      if (comp(*next, *first))
        return false;
      first = next;
    }
  }
  return true;
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## now

```cpp
///hide
#include <functional>

template<typename ForwardIt, typename Comp = std::less<>>
constexpr bool 
is_sorted(ForwardIt first, ForwardIt last, Comp comp = {}) {
  if (first != last) {
    auto next = first;
    while (++next != last) {
      if (comp(*next, *first))
        return false;
      first = next;
    }
  }
  return true;
}

///unhide
template<typename Cont>
constexpr bool is_sorted(Cont&& cont) {
  return is_sorted(std::begin(cont), std::end(cont));
}

constexpr int arr[] = {1, 2, 4, 3};
static_assert(not is_sorted(arr), "checked!");
```

---

## or just sort it

```cpp [7-20]
///hide
#include <functional>

///unhide
template<typename BidirIt>
constexpr auto prev(BidirIt it) {
  auto res = it;
  return --res;
}

template<typename BidirIt, typename Comp = std::less<>>
constexpr void 
sort(BidirIt first, BidirIt last, Comp comp = {}) {
  for (auto it = first; it != last; ++it) {
    auto curr = it;
    const auto temp = *curr;
    for (auto before = prev(curr);
         curr != first && comp(temp, *before);
        --curr, --before) {
      *curr = *before;
    }
    *curr = temp;
  }
}
```

<!-- .element: style="font-size: 0.35em" -->

Note: this is an insertion sort, but more complex sorting algorithms can also be implemented

---

## now

```cpp [1-9|11-13]
///options+=-std=c++17
///hide
#include <functional>

template<typename BidirIt>
constexpr auto prev(BidirIt it) {
  auto res = it;
  return --res;
}

template<typename BidirIt, typename Comp = std::less<>>
constexpr void 
sort(BidirIt first, BidirIt last, Comp comp = {}) {
  for (auto it = first; it != last; ++it) {
    auto curr = it;
    const auto temp = *curr;
    for (auto before = prev(curr);
         curr != first && comp(temp, *before);
        --curr, --before) {
      *curr = *before;
    }
    *curr = temp;
  }
}

template<typename ForwardIt, typename Comp = std::less<>>
constexpr bool 
is_sorted(ForwardIt first, ForwardIt last, Comp comp = {}) {
  if (first != last) {
    auto next = first;
    while (++next != last) {
      if (comp(*next, *first))
        return false;
      first = next;
    }
  }
  return true;
}

template<typename Cont>
constexpr bool is_sorted(Cont&& cont) {
  return is_sorted(std::begin(std::forward<Cont>(cont)), std::end(std::forward<Cont>(cont)));
}

template <typename T, std::size_t N>
class constexpr_array {
public:
  using iterator = T*;
  using const_iterator = const T*;

  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }
  constexpr const_iterator begin() const { return std::begin(m_data); }
  constexpr const_iterator end() const { return std::end(m_data); }

private:
  T m_data[N] {};
};

///unhide
template<typename T, size_t N>
constexpr auto sort(const T(& cont)[N]) {
  constexpr_array<T, N> sorted;
  for (size_t i = 0; i < N; ++i) {
      sorted[i] = cont[i];
  }
  sort(sorted.begin(), sorted.end());
  return sorted;
}

constexpr int arr[] = {1, 2, 4, 3};
constexpr auto sorted = sort(arr);
static_assert(is_sorted(sorted), "checked");
```

Note:
compile time map

---

## associative containers

```cpp [1-2,30|3,9-15|23-29]
///hide
#include <functional>
#include <stdexcept>

template<typename BidirIt, typename Comp = std::less<>>
constexpr void 
sort(BidirIt first, BidirIt last, Comp comp = {});

template<class InputIt, class OutputIt>
constexpr OutputIt copy(InputIt first, InputIt last, OutputIt d_first);

template<size_t N, class ForwardIt, class T, class Compare = std::less<>>
constexpr ForwardIt lower_bound(ForwardIt first, const T& value, Compare comp = {});

///unhide
template <typename T, std::size_t N>
class constexpr_set {
  T m_data[N] {};

public:
  using iterator = T*;
  using const_iterator = const T*;

  constexpr constexpr_set(std::initializer_list<T> list) {
    if (list.size() != N) {
      throw std::logic_error("size mismatch");
    }
    copy(list.begin(), list.end(), m_data);
    sort(begin(), end());
  }
  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }
  constexpr const_iterator begin() const { return std::begin(m_data); }
  constexpr const_iterator end() const { return std::end(m_data); }
  constexpr const_iterator find(const T& value) const { 
    auto it = lower_bound<N>(begin(), value);
    if (it != end() && !(value < *it)) {
      return it;
    }
    return end();
  }
};
```

<!-- .element: style="font-size: 0.4em" -->

---

## `lower_bound`

```cpp [1-4,15|5-7|9-14]
///hide
#include <cstddef>
#include <functional>

///unhide
template<size_t N, class ForwardIt, class T, class Compare = std::less<>>
constexpr ForwardIt lower_bound(ForwardIt first, const T& value, 
                                Compare comp = {})
{
  if (N == 0) {
    return first;
  }

  constexpr auto half = N / 2;
  auto it = first + half;
  if (comp(*it, value)) {
      return lower_bound<N - (half + 1)>(next(it), value, comp);
  }
  return lower_bound<half>(first, value);
}
```

<!-- .element: style="font-size: 0.4em" -->

Note: take only a first iterator because size is templated, which generates better code than passing size as a parameter

---

## benchmark

```cpp
///external
///options=-std=c++14 -O3
///compiler=clang1000
///libs=benchmark:150
///hide
#include <benchmark/benchmark.h>
#include <functional>
#include <set>
#include <stdexcept>

template<typename BidirIt>
constexpr auto next(BidirIt it) {
  return ++it;
}

template<typename BidirIt>
constexpr auto prev(BidirIt it) {
  return --it;
}

template<typename BidirIt, typename Comp = std::less<>>
constexpr void 
sort(BidirIt first, BidirIt last, Comp comp = {}) {
  if (first == last) {
    return;
  }

  for (auto it = next(first); it != last; ++it) {
    auto curr = it;
    const auto temp = *curr;
    for (auto before = prev(curr);
         curr != first && comp(temp, *before);
        --curr, --before) {
      *curr = *before;
    }
    *curr = temp;
  }
}

template<size_t N, class ForwardIt, class T, class Compare = std::less<>>
constexpr ForwardIt lower_bound(ForwardIt first, const T& value, Compare comp = {})
{
  if (N == 0) {
    return first;
  }

  constexpr auto half = N / 2;
  auto it = first + half;
  if (comp(*it, value)) {
      return lower_bound<N - (half + 1)>(next(it), value, comp);
  }
  return lower_bound<half>(first, value);
}

template<class InputIt, class OutputIt>
constexpr OutputIt copy(InputIt first, InputIt last, 
              OutputIt d_first)
{
    while (first != last) {
        *d_first++ = *first++;
    }
    return d_first;
}

template <typename T, std::size_t N>
class constexpr_set {
public:
  using iterator = T*;
  using const_iterator = const T*;

  constexpr constexpr_set(std::initializer_list<T> list) {
    if (list.size() != N) {
      throw std::logic_error("size mismatch");
    }
    copy(list.begin(), list.end(), m_data);
    sort(std::begin(m_data), std::end(m_data));
  }
  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }
  constexpr const_iterator begin() const { return std::begin(m_data); }
  constexpr const_iterator end() const { return std::end(m_data); }
  constexpr const_iterator find(const T& value) const { 
    auto it = lower_bound<N>(begin(), value, std::less<>{});
    if (it != end() && !(value < *it)) {
      return it;
    }
    return end();
  }

private:
  T m_data[N] {};
};

///unhide
static constexpr constexpr_set<int, 32> constexprSet{
  0, 2, 4, 6, 8, 10, 12, 14,
  16, 18, 20, 22, 24, 26, 28, 30,
  32, 34, 36, 38, 40, 42, 44, 46,
  48, 50, 52, 54, 56, 58, 60, 62
};

static void ConstexprSet(benchmark::State& state) {
  for (auto _ : state) {
    for (int i = 0; i < 50; ++i) {
      volatile bool status = constexprSet.find(i) != constexprSet.end();
      benchmark::DoNotOptimize(status);
    }
  }
}
BENCHMARK(ConstexprSet);

static const std::set<int> stdSet(constexprSet.begin(), constexprSet.end());

static void StdSet(benchmark::State& state) {
  for (auto _ : state) {
    for (int i = 0; i < 50; ++i) {
      volatile bool status = stdSet.find(i) != stdSet.end();
      benchmark::DoNotOptimize(status);
    }
  }
}
BENCHMARK(StdSet);

///hide
BENCHMARK_MAIN();
```

<!-- .element: style="font-size: 0.4em" -->

---

## testing

```cpp
///libs=catch2:2110
///hide
#include <functional>
#include <set>
#include <stdexcept>
//#define CATCH_CONFIG_MAIN
///unhide
#include <catch.hpp>

///hide
template<typename BidirIt>
constexpr auto next(BidirIt it) {
  return ++it;
}

template<typename BidirIt>
constexpr auto prev(BidirIt it) {
  return --it;
}

template<typename BidirIt, typename Comp = std::less<>>
constexpr void 
sort(BidirIt first, BidirIt last, Comp comp = {}) {
  if (first == last) {
    return;
  }

  for (auto it = next(first); it != last; ++it) {
    auto curr = it;
    const auto temp = *curr;
    for (auto before = prev(curr);
         curr != first && comp(temp, *before);
        --curr, --before) {
      *curr = *before;
    }
    *curr = temp;
  }
}

template<size_t N, class ForwardIt, class T, class Compare = std::less<>>
constexpr ForwardIt lower_bound(ForwardIt first, const T& value, Compare comp = {})
{
  if (N == 0) {
    return first;
  }

  constexpr auto half = N / 2;
  auto it = first + half;
  if (comp(*it, value)) {
      return lower_bound<N - (half + 1)>(next(it), value, comp);
  }
  return lower_bound<half>(first, value);
}

template<class InputIt, class OutputIt>
constexpr OutputIt copy(InputIt first, InputIt last, 
              OutputIt d_first)
{
    while (first != last) {
        *d_first++ = *first++;
    }
    return d_first;
}

template <typename T, std::size_t N>
class constexpr_set {
public:
  using iterator = T*;
  using const_iterator = const T*;

  constexpr constexpr_set(std::initializer_list<T> list) {
    if (list.size() != N) {
      throw std::logic_error("size mismatch");
    }
    copy(list.begin(), list.end(), m_data);
    sort(std::begin(m_data), std::end(m_data));
  }
  constexpr std::size_t size() const { return N; }
  constexpr T& operator[](std::size_t n) { return m_data[n]; }
  constexpr const T& operator[](std::size_t n) const { return m_data[n]; }
  constexpr iterator begin() { return std::begin(m_data); }
  constexpr iterator end() { return std::end(m_data); }
  constexpr const_iterator begin() const { return std::begin(m_data); }
  constexpr const_iterator end() const { return std::end(m_data); }
  constexpr const_iterator find(const T& value) const { 
    auto it = lower_bound<N>(begin(), value, std::less<>{});
    if (it != end() && !(value < *it)) {
      return it;
    }
    return end();
  }

private:
  T m_data[N] {};
};

///unhide
static constexpr constexpr_set<int, 32> constexprSet{
  0, 2, 4, 6, 8, 10, 12, 14,
  16, 18, 20, 22, 24, 26, 28, 30,
  32, 34, 36, 38, 40, 42, 44, 46,
  48, 50, 52, 54, 56, 58, 60, 62
};

TEST_CASE("test constexpr set") {
    STATIC_REQUIRE(constexprSet.find(1) == constexprSet.end());
    STATIC_REQUIRE(constexprSet.find(42) != constexprSet.end());
    STATIC_REQUIRE(constexprSet.find(100) == constexprSet.end());
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## unordered containers

![hash](11_containers/hash.svg)

<!-- .element: class="bright_background" -->

---

## minimal perfect hash

![perfect hash](13_constexpr/hash_perfect.svg)

<!-- .element: class="bright_background" -->

Note: how to generate a perfect hash?

---

## minimal perfect hash step 0

![condensed hash](13_constexpr/hash_condensed.svg)

<!-- .element: class="bright_background" -->

Note: hash table size will be number of elements

---

## helper hash

```cpp
///hide
#include <cstddef>

///unhide
template<typename Key>
std::size_t helper_hash(const Key& key, 
                        const std::size_t seed);
```

---

## minimal perfect hash step 1

![first bucket hash](13_constexpr/hash_first_bucket.svg)

<!-- .element: class="bright_background" -->

`helper_hash("Sandra Dee", 5123) == 0`
`helper_hash("John Smith", 5123) == 3`

Note: starting with the largest bucket we randomly find a seed such that all the bucket
elements map to distinct free slots

---

<!-- .slide: data-auto-animate -->

## minimal perfect hash step 2

FILE: 13_constexpr/hash_second_bucket.svg

<!-- .element: class="bright_background" -->

`helper_hash("Lisa Smith", 6161) == 1`

---

## minimal perfect hash final

![final perfect hash](13_constexpr/hash_final.svg)

<!-- .element: class="bright_background" -->

---

## benchmark

![frozen](13_constexpr/frozen.png)

---

<!-- .slide: data-background-image="13_constexpr/serene.gif" -->

## C++17 serene &nbsp; `constexpr`

<!-- .element: class="chapter" -->

<div class="footnotes">

Sources: 

  - [N4487](https://wg21.link/n4487), Faisal Vali, Ville Voutilainen, Gabriel Dos Reis
  - [P0128](https://wg21.link/p0128), Ville Voutilainen & Daveed Vandevoorde
  - [Simplifying templates and `#ifdefs` with `if constexpr`](https://blog.tartanllama.xyz/if-constexpr/), Sy Brand

</div>

Note: C++17 kept making `constexpr` code less restricted and more user friendly

---

<!-- .slide: id="constexpr_lambda" -->

## `constexpr` lambda

```cpp
///options+=-std=c++17
constexpr auto add = [](int n, int m) {
  auto L = [=]{ return n; };
  auto R = [=]{ return m; };
  return [=]{ return L()+R(); };
};
static_assert(add(3,4)() == 7);
```

Note: starting from C++17, `static_assert` does not require a message

---

<!-- .slide: id="variable_templates" class="aside" data-auto-animate -->

## variable templates (C++14)

Instead of

```cpp []
///hide
#include <iostream>
///unhide
#include <type_traits>

template <typename T>
struct is_float {
  static constexpr bool value = std::is_same<T, float>::value;
};

template <typename T>
void test(T t){
  if (is_float<T>::value){
    std::cout << "I'm a float\n";
  } else {
    std::cout << "I'm not a float\n";
  }
}
```

<!-- .element: style="font-size: 0.5em" data-id="code" -->

Source: [Baptiste Wicht's blog](https://baptiste-wicht.com/posts/2017/08/simplify-your-type-traits-with-c%2B%2B14-variable-templates.html)

<!-- .element: class="footnote" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## variable templates (C++14)

Write

```cpp []
///options+=-std=c++17
///hide
#include <iostream>
///unhide
#include <type_traits>

template <typename T>
constexpr bool is_float_v = std::is_same_v<T, float>;

template <typename T>
void test(T t){
  if (is_float_v<T>){
    std::cout << "I'm a float\n";
  } else {
    std::cout << "I'm not a float\n";
  }
}
```

<!-- .element: style="font-size: 0.5em" data-id="code" -->

Source: [Baptiste Wicht's blog](https://baptiste-wicht.com/posts/2017/08/simplify-your-type-traits-with-c%2B%2B14-variable-templates.html)

<!-- .element: class="footnote" -->

---

## variadic recursion

```cpp
template <class T> 
void f(T&& t) {
  // handle one T
} 

template <class T, class... Rest> 
void f(T&& t, Rest&&... r) {
  f(t); 
  // handle the tail
  f(r...); // should I have a zero-param overload?
}
```

Note: C++17 introduces another `constexpr` related feature which attempts to solve the following annoying problems.

---

## SFINAE 

```cpp
///options+=-std=c++17
///hide
#include <type_traits>
#include <memory>

///unhide
template <class T, class... Args> 
std::enable_if_t<std::is_constructible_v<T, Args...>, std::unique_ptr<T>> 
optionalFactory(Args&&... args) 
{
  return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}  

template <class T, class... Args>  
std::enable_if_t<!std::is_constructible_v<T, Args...>, nullptr_t>
optionalFactory(Args&&... args) 
{
  return nullptr;
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: this factory generates a unique_ptr if given the right set of arguments, otherwise it returns null.

---

## conditional compilation

```cpp
///hide
#include <cstdint>
#ifdef __APPLE__
#include <pthread.h>
#elif __linux__
#include <unistd.h>
#include <sys/syscall.h> 
#elif _WIN32
#include <processthreadsapi.h>
#endif
///unhide

auto thread_id() {
#ifdef __APPLE__
  uint64_t thisThreadId;
  pthread_threadid_np(nullptr, &thisThreadId);
  return thisThreadId;
#elif __linux__
  return syscall(__NR_gettid);
#elif _WIN32
  return GetCurrentThreadId();
#endif
}
```

---

<!-- .slide: id="constexpr_if" -->

## `constexpr if`

```cpp
///options+=-std=c++17
template <class T, class... Rest> 
void f(T&& t, Rest&&... r) {
  // handle one T 
  if constexpr (sizeof...(r)) {
    // handle the tail 
    f(r...); // no zero-param overload is needed
  }
}
```

---

## and

```cpp
///options+=-std=c++17
///hide
#include <type_traits>
#include <memory>

///unhide
using namespace std;

template <class T, class... Args> 
auto optionalFactory(Args&&... args) {
  if constexpr (is_constructible_v<T, Args...>) {
    return unique_ptr<T>(new T(forward<Args>(args)...));
  } else {
    return nullptr;
  }
}

auto x = optionalFactory<int>(1, 2, 3);
static_assert(std::is_same_v<decltype(x), nullptr_t>);
```

Note: notice that each branch returns a different type

---

## and almost

```cpp []
///options+=-std=c++17
///fails='pthread_threadid_np' was not declared in this scope
///hide
#include <cstdint>
#ifdef __APPLE__
#include <pthread.h>
#elif __linux__
#include <unistd.h>
#include <sys/syscall.h> 
#elif _WIN32
#include <processthreadsapi.h>
#endif

///unhide
enum class OS { Linux, Mac, Windows };

//Translate the macros to C++ 
// at a single point in the application
#ifdef __linux__
constexpr OS the_os = OS::Linux;
#elif __APPLE__
constexpr OS the_os = OS::Mac;
#elif __WIN32
constexpr OS the_os = OS::Windows;
#endif

auto thread_id() {
  if constexpr (the_os == OS::Mac) {
    uint64_t thisThreadId;
    pthread_threadid_np(nullptr, &thisThreadId);
    return thisThreadId;
  } else if constexpr (the_os == OS::Linux) {
    return syscall(__NR_gettid);
  } else if constexpr (the_os == OS::Windows) {
    return GetCurrentThreadId();
  }
}
```

<!-- .element: class="split" -->

Note: catches typos!

---

## need declarations

```cpp [13-20]
///options+=-std=c++17
///hide
#include <cstdint>
#ifdef __APPLE__
#include <pthread.h>
#elif __linux__
#include <unistd.h>
#include <sys/syscall.h> 
#elif _WIN32
#include <processthreadsapi.h>
#endif

///unhide
enum class OS { Linux, Mac, Windows };

//Translate the macros to C++ 
// at a single point in the application
#ifdef __linux__
constexpr OS the_os = OS::Linux;
#elif __APPLE__
constexpr OS the_os = OS::Mac;
#elif __WIN32
constexpr OS the_os = OS::Windows;
#endif

using DWORD = uint32_t;
DWORD GetCurrentThreadId();
long syscall(long number, ...);
///hide
#ifndef __NR_gettid
///unhide
extern long __NR_gettid;
///hide
#endif
///unhide
typedef struct _opaque_pthread_t *
  __darwin_pthread_t;
typedef __darwin_pthread_t pthread_t;
int pthread_threadid_np(pthread_t thread, 
                        uint64_t *thread_id);

auto thread_id() {
  if constexpr (the_os == OS::Mac) {
    uint64_t thisThreadId;
    pthread_threadid_np(nullptr, &thisThreadId);
    return thisThreadId;
  } else if constexpr (the_os == OS::Linux) {
    return syscall(__NR_gettid);
  } else if constexpr (the_os == OS::Windows) {
    return GetCurrentThreadId();
  }
}












```

<!-- .element: class="split" -->

---

## more realistically

```cpp
///options+=-std=c++17
constexpr bool debug_mode = 
#ifdef NDEBUG
  false;
#else
  true;
#endif

void do_work() {
  if constexpr (debug_mode) {
    //some expensive check
  }
}
```

---

## note

```cpp
///options+=-std=c++17
///fails=static assertion failed: Must be arithmetic
///hide
#include <type_traits>

///unhide
template <typename T>
void do_something() {
  if constexpr (std::is_arithmetic_v<T>) {
    //do some maths
  }
  else {
    //invalid for all specializations
    static_assert(false, "Must be arithmetic");
  }
}
```

---

## instead

```cpp
///options+=-std=c++17
///hide
#include <type_traits>

///unhide
template <typename T>
void do_something() {
  static_assert(std::is_arithmetic_v<T>, "Must be arithmetic");
  //do some maths
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## need that else

```cpp
///options+=-std=c++17
///fails=inconsistent deduction for auto return type: 'int' and then 'int*'
///hide
#include <type_traits>

///unhide
template <typename T>
auto get_value(T t) {
  if constexpr (std::is_pointer_v<T>)
    return *t;

  return t;
}

int main() {
  int i;
  get_value(&i); // error
}
```

---

## in standard library

- more `chrono`
- `char_traits`

---

<!-- .slide: data-background-image="13_constexpr/contented.gif" -->

## C++20 contented &nbsp; `constexpr`

<!-- .element: class="chapter" -->

<div class="footnotes">

Sources: 

  - [P2131](https://wg21.link/p2131), Thomas Köppe

</div>

---

<!-- .slide: id="20_constexpr" -->

## C++20 `constexpr` functions

can do much more!

- `new`/`delete`
- virtual function calls
- `dynamic_cast`
- uninitialized variables*

\* as long as they're initialized before being read

<!-- .element: class="footnote" -->

---

<!-- .slide: class="aside" -->

### mathematical constants (C++20)

`$$ (\sin(e)^2 + \cos(e)^2 + e^{\ln 2} + \sqrt{\pi} \frac{1}{\sqrt{\pi}} + \cosh{\pi}^2 - \sinh{\pi}^2 + \sqrt{3} \cdot \frac{1}{\sqrt{3}} \cdot \log_2{e} \cdot \ln 2 \cdot \log_{10}{e} \cdot \ln 10 \cdot \pi \cdot \frac{1}{\pi} + (\phi^2 - \phi)) \cdot (\sqrt{2} \sqrt{3})^2 $$`

<!-- .element: style="font-size: 0.4em" -->

```cpp
///external
///options+=-std=c++2a
///hide
#include <iostream>
#include <cmath>
///unhide
#include <numbers>

///hide
int main() {
using std::pow;
using std::sin;
using std::cos;
using std::sinh;
using std::cosh;
///unhide
using namespace std::numbers;
std::cout << "The answer is " <<
  (pow(sin(e), 2) + pow(cos(e), 2)
    + pow(e, ln2) + sqrt(pi) * inv_sqrtpi 
    + pow(cosh(pi), 2) - pow(sinh(pi), 2)
    + sqrt3 * inv_sqrt3 * log2e * ln2 
    * log10e * ln10 * pi * inv_pi 
    + (phi * phi - phi)) 
  * pow(sqrt2 * sqrt3, 2) 
  << '\n';
///hide
}
```

---

<!-- .slide: class="aside" -->

## can have custom precision

```cpp
///external
///options+=-std=c++2a
///hide
#include <iostream>
#include <iomanip>
///unhide
#include <numbers>

template<typename T>
auto precision = std::setprecision(std::numeric_limits<T>::digits10 + 1);

///hide
int main() {
///unhide
using namespace std::numbers;
std::cout << "π<float>       = " << precision<float>
          << pi_v<float> << '\n';
std::cout << "π<double>      = " << precision<double>
          << pi_v<double> << '\n';
std::cout << "π<long double> = " << precision<long double>
          << pi_v<long double> << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

---

### back to `constexpr` functions

```cpp [1-4|6-14|16-24|26|28-33|35-43]
///options+=-std=c++2a
///hide
#include <numbers>
#include <limits>

///unhide
class Shape {
public:
    constexpr virtual double area() = 0;
};

class Square : public Shape {
public:
    constexpr Square(double side) : m_side{side} {}
    constexpr double area() override { 
      return m_side * m_side; 
    }
private:
    double m_side;
};

class Circle : public Shape {
public:
    constexpr Circle(double radius) : m_radius{radius} {}
    constexpr double area() override { 
      return m_radius * 2 * std::numbers::pi; 
    }
private:
    double m_radius;
};

class InfiniteShape : public Shape {};

constexpr double area(Shape& shape) {
    if (dynamic_cast<InfiniteShape*>(&shape)) {
        return std::numeric_limits<double>::infinity();
    }
    return shape.area();
}

constexpr double square(double x) {
    auto square = new Square(x);
    double res;
    res = area(*square);
    delete square;
    return res;
}

static_assert(square(4) == 16);
```

Note: memory must be freed before the function returns.
unfortunately `unique_ptr` is still not `constexpr`, but there's proposal [P2273](https://wg21.link/p2273) for it 

---

## special member functions

```cpp
///options+=-std=c++2a
struct S{
  S() = default;
  S(const S&) = default;
  S(S&&) = default;
  S& operator=(const S&) = default;
  S& operator=(S&&) = default;
  ~S() = default;
};
```

Note: open C++ Insights

---

<!-- .slide: id="consteval" -->

## immediate functions

```cpp [1|3|4-5]
///options+=-std=c++2a
///fails=the value of 'x' is not usable in a constant expression
consteval int sqr(int n) { return n * n; }

constexpr int r = sqr(100);  // okay
int x = 100;
int r2 = sqr(x);             // fails
```

Note: changing `sqr` to be `constexpr` will generate a run-time call

---

### cannot be called from non-immediate functions

```cpp
///options+=-std=c++2a
///fails='n' is not a constant expression
consteval int sqr(int n) { return n * n; }

consteval int sqrsqr(int n) { return sqr(sqr(n)); } // okay

constexpr int dblsqr(int n) { return 2 * sqr(n); }  // fails
```

---

## checking `constexpr`

```cpp [1-20|2-16|16-19|22-29]
///options+=-std=c++2a
///hide
#include <type_traits>
#include <cmath>
#include <iostream>

///unhide
constexpr double power(double b, int x) {
  if (std::is_constant_evaluated() 
      && !(b == 0.0 && x < 0)) {
    // A constant-evaluation context: 
    // Use a constexpr-friendly algorithm.
    if (x == 0)
      return 1.0;
    double r = 1.0, p = x > 0 ? b : 1.0 / b;
    auto u = unsigned(x > 0 ? x : -x);
    while (u != 0) {
      if (u & 1) r *= p;
      u /= 2;
      p *= p;
    }
    return r;
  } else {
    // Let the code generator figure it out.
    return std::pow(b, double(x));
  }
}
 
///hide
int main()
{
///unhide
// A constant-expression context
constexpr double kilo = power(10.0, 3);
int n = 3;
// Not a constant expression
// Equivalent to std::pow(10.0, double(n))
double mucho = power(10.0, n);

std::cout << kilo << " " << mucho << "\n";
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->


---

## careful

```cpp
///options+=-std=c++2a
#include <type_traits>

constexpr void foo() {
  if constexpr(std::is_constant_evaluated()) {
    // always true
  }

  // unrechable
}
```

---

## Static Initialization Order Fiasco

<div class="grid2">

```cpp []
int quad(int n) {
  return n * n;
}

auto staticA  = quad(5); 
```

```cpp []
///noexecute
#include <iostream>

extern int staticA;
auto staticB = staticA;

int main() {
  std::cout << "staticB: " << staticB << '\n';
}
```

`source.cpp`

`main.cpp`

</div>

[0](https://wandbox.org/permlink/ONU4IxN72Cxo9Djy) or [25](https://wandbox.org/permlink/0A8N5XQfGyTLbl5V) ?

Source: [Modernes C++](https://www.modernescpp.com/index.php/c-20-static-initialization-order-fiasco)

<!-- .element: class="footnote" -->

Note: `staticB` is zero-initialized at compile-time and dynamically initialized at run-time, but there's no guaranteed order between init of `staticA` and `staticB`. You have a 50:50 chance that `staticB` is 0 or 25. 

---

## solving with local static

<div class="grid2">

```cpp [6-8]
int quad(int n) {
  return n * n;
}

int& staticA() {
  static auto staticA  = quad(5);
  return staticA;
}
```

```cpp [3-4]
///noexecute
#include <iostream>

int& staticA();
auto staticB = staticA();

int main() {
  std::cout << "staticB: " << staticB << '\n';
}
```

`source.cpp`

`main.cpp`

</div>

[25](https://wandbox.org/permlink/X240UBJDGDfhlWCC) and [25](https://wandbox.org/permlink/KTHBKtufJx25hDut)

---

<!-- .slide: id="constinit" -->

## solving with `constinit`

<div class="grid2">

```cpp [1,5]
///options+=-std=c++2a
constexpr int quad(int n) {
  return n * n;
}

constinit auto staticA = quad(5);
```

```cpp [3-4]
///noexecute
///options+=-std=c++2a
#include <iostream>

extern constinit int staticA;
auto staticB = staticA;

int main() {
  std::cout << "staticB: " << staticB << '\n';
}
```

`source.cpp`

`main.cpp`

</div>

[25](https://wandbox.org/permlink/vtBfs6nL7Os9u8bq) and [25](https://wandbox.org/permlink/0hb2JWFQWgQmuhGQ)

Note: removing `constexpr` from `quad` will fail compilation.

---

## `constinit` is not `const`

```cpp
///options+=-std=c++2a
constexpr int quad(int n) {
  return n * n;
}

constinit auto staticA = quad(5);

void setStaticA(int value) {
  staticA = value;
}
```

Note: only static and thread local storage duration variables can be declared `constinit`.

---

<!-- .slide: id="20_constexpr_lib" -->

## in standard library

- **`string`, &nbsp; `vector`**
- **`algorithms`**
- <!-- .element: class="fragment" data-fragment-index="0" --> <code>pair</code>, &nbsp; <code>tuple</code>
- <!-- .element: class="fragment" data-fragment-index="0" --> <code>complex</code> &nbsp; operators
- <!-- .element: class="fragment" data-fragment-index="0" --> <code>swap</code>
- <!-- .element: class="fragment" data-fragment-index="0" --> <code>chrono</code> &nbsp; constants

---


<!-- .slide: data-background-image="13_constexpr/continued.gif" -->

## `to be continued...`

<!-- .element: class="chapter bottom" -->