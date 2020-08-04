<!-- .slide: data-background-image="07_chrono/cantona.jpg" data-background-size="contain" -->

---

## how much time

```cpp
///hide
void sleep(int);

void foo() {
///unhide
sleep(10);
///hide
}
```

Need to check [documentation](https://man7.org/linux/man-pages/man3/sleep.3.html)

<!-- .element: class="fragment" -->

---

<!-- .slide: id="chrono" data-background-image="07_chrono/chrono.gif" -->

<div class="footnote">

Source: [CppCon 2016: Howard Hinnant "A ＜chrono＞ Tutorial"](https://www.youtube.com/watch?v=P32hvk8b13M)

</div>

# `std::chrono`

<!-- .element: class="chapter" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

Scalar-like construction behavior

```cpp
#include <chrono>
///hide
void foo() {
{
///unhide
std::chrono::seconds s; // no initialization
///hide
}
{
///unhide
std::chrono::seconds s{}; // zero initialization
///hide
}
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

no implicit convesion from int

```cpp
///fails=conversion from 'int' to non-scalar type 'std::chrono::seconds'
#include <chrono>
///hide
void foo() {
{
///unhide
std::chrono::seconds s = 3; // fails
///hide
}
{
///unhide
std::chrono::seconds s{3}; // good
///hide
}
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: class="aside" -->

## new integer types

Exact-width integer types

<div class="split">

- int8_t
- int16_t
- int32_t
- int64_t
- uint8_t
- uint16_t
- uint32_t
- uint64_t

</div>

Note: `(u)intN_t` designates a (un)signed integer type with width N, no padding
bits, and a two’s complement representation.

---

<!-- .slide: class="aside" -->

## new integer types

Minimum-width integer types

<div class="split">

- int_least8_t
- int_least16_t
- int_least32_t
- int_least64_t
- uint_least8_t
- uint_least16_t
- uint_least32_t
- uint_least64_t

</div>

Note: `(u)int_leastN_t` designates a (un)signed integer type with a width of at least N,  such that no signed integer type with lesser size has at least the specified width.

---

<!-- .slide: class="aside" -->

## new integer types

Fastest minimum-width integer types

<div class="split">

- int_fast8_t
- int_fast16_t
- int_fast32_t
- int_fast64_t
- uint_fast8_t
- uint_fast16_t
- uint_fast32_t
- uint_fast64_t

</div>

Note: `(u)int_fastN_t` designates the fastest (un)signed integer type with a width of at fast N.

---

<!-- .slide: class="aside" -->

## new integer types

Integer types capable of holding object pointers

<div class="split">

- intptr_t
- uintptr_t

</div>

Note: `(u)intptr_t` designates a (un)signed integer type with the property that any valid
pointer to `void` can be converted to this type, then converted back to pointer to `void`,
and the result will compare equal to the original pointer.

---

<!-- .slide: class="aside" -->

## new integer types

Greatest-width integer types

<div class="split">

- intmax_t
- uintmax_t

</div>

Note: `(u)intmax_t` designates a (un)signed integer type capable of representing any value of
any (un)signed integer type.

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

no implicit convesion to int

```cpp
///fails=cannot convert 'std::chrono::seconds'
#include <chrono>
///hide
void foo() {
{
///unhide
int64_t s = std::chrono::seconds{3}; // fails
///hide
}
{
///unhide
int64_t s = std::chrono::seconds{3}.count(); // good
///hide
}
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

Addition and subtraction

```cpp
#include <chrono>

using std::chrono::seconds;

void f(seconds d);

///hide
void foo() {
///unhide
seconds x{3};
x += seconds{3};
f(x); // f(5 seconds)
x = x - seconds{1};
f(x); // f(4 seconds)
// f(x + 1); // error: seconds + int not allowed
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

comparison

```cpp
///hide
#include <chrono>
#include <iostream>

///unhide
using std::chrono::seconds;

const auto time_limit = seconds{2};

void f(seconds d)
{
  if (d <= time_limit)
    std::cout << "in time: ";
  else
    std::cout << "out of time: ";
  std::cout << d.count() << "s\n";
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

comparison

```cpp
///fails=no match for 'operator<='
///hide
#include <chrono>
#include <iostream>

///unhide
using std::chrono::seconds;

const auto time_limit = 2;

void f(seconds d)
{
  if (d <= time_limit) // error: seconds <= int not allowed
    std::cout << "in time: ";
  else
    std::cout << "out of time: ";
  std::cout << d.count() << "s\n";
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

range of ±292 billion years

```cpp
///hide
#include <chrono>
#include <iostream>

///unhide
using std::chrono::seconds;

int main() {
  const auto secondsInAYear = 60 * 60 * 24 * 365;
  std::cout
   << seconds::max().count() / secondsInAYear << '\n'
   << seconds::min().count() / secondsInAYear << '\n'; 
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## `std::chrono::seconds`

[How much does it cost?!](https://quick-bench.com/q/2Ff1rtmFfBcm--J0RpTYpWbbCW0)

---

<!-- .slide: class="aside" -->

## literals

```cpp
auto a{42}, b{052}, c{0x2A};  // integer, int
auto d{4.27}, e{5E1};         // floating point, double
auto f{'f'}, g{'\n'};         // character, char
auto h = "foo";               // string, const char[4]
auto i{true}, k{false};       // boolean, bool
```

<div class="footnote">

Source: [SIMPLIFY C++](https://arne-mertz.de/2016/10/modern-c-features-user-defined-literals/)

</div>

---

<!-- .slide: id="utf_chars" class="aside" -->

## new character types and literals

```cpp
///hide
#include <iostream>

int main() {
///unhide
char const utf8[]{u8"Hello, ☃!"};
char16_t const utf16[]{u"Hello, ☃!"};
char32_t const utf32[]{U"Hello, ☃!"};

std::cout 
  << "sizeof(utf8) = " << sizeof(utf8) << '\n'
  << "sizeof(utf16) = " << sizeof(utf16) << '\n'
  << "sizeof(utf32) = " << sizeof(utf32) << '\n';
///hide
}
```

from C++20:

```cpp
///compiler=g93
///options=-std=c++2a
char8_t const utf8[]{u8"Hello, ☃!"};
```

Note: char8_t was introduced to enable overloading between char and char8_t

---

<!-- .slide: class="aside" -->

## literal suffixes

```cpp
auto a{32u};     // unsigned int
auto b{043l};    // long
auto c{0x34ull}; // unsigned long long
auto d{4.27f};   // float
auto e{5E1l};    // long double
```

---

<!-- .slide: class="aside" data-auto-animate -->

## user-defined literals

```cpp []
///hide
#include <cmath>
#include <cassert>

///unhide
const auto PI = 3.14159265358979323846264L;

long double operator""_deg ( long double deg )
{
    return deg * PI / 180;
}

///hide
int main() {
///unhide
assert(std::sin(90.0_deg) == 1);
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## user-defined literals

alternatively

```cpp []
///hide
#include <cmath>
#include <cassert>
#include <string>

///unhide
const auto PI = 3.14159265358979323846264L;

long double operator""_deg ( const char* deg )
{
    return std::stold(deg) * PI / 180;
}

///hide
int main() {
///unhide
assert(std::sin(90.0_deg) == 1);
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## user-defined literals

also takes integrals

```cpp []
///hide
#include <cmath>
#include <cassert>
#include <string>

///unhide
const auto PI = 3.14159265358979323846264L;

long double operator""_deg ( const char* deg )
{
    return std::stold(deg) * PI / 180;
}

///hide
int main() {
///unhide
assert(std::sin(90_deg) == 1);
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## allowed paramaters

user-defined integer literals

```cpp
///hide
struct T {};

///unhide
T operator""_suffix ( unsigned long long int );

T x = 42_suffix;
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## allowed paramaters

user-defined floating-point literals

```cpp
///hide
struct T {};

///unhide
T operator""_suffix ( long double );

T x = 42.0_suffix;
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## allowed paramaters

raw literal operators

```cpp
///hide
struct T {};

///unhide
T operator""_suffix ( const char* );

T x = 42_suffix;

T y = 42.0_suffix;
```

<!-- .element: data-id="code2" -->

used as fallbacks for integer and floating-point user-defined literals

---

<!-- .slide: class="aside" data-auto-animate -->

## allowed paramaters

user-defined character literals

```cpp
///compiler=g93
///options=-std=c++2a
///hide
struct T {};

///unhide
T operator""_suffix ( char );
T operator""_suffix ( wchar_t );
T operator""_suffix ( char8_t ); // C++20
T operator""_suffix ( char16_t );
T operator""_suffix ( char32_t );

T x = u'4'_suffix;
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: id="UDL" class="aside" data-auto-animate -->

## allowed paramaters

user-defined string literals

```cpp
///compiler=g93
///options=-std=c++2a
///hide
#include <cstdint>

struct T {};

///unhide
T operator""_suffix ( const char     * , std::size_t );
T operator""_suffix ( const wchar_t  * , std::size_t );
T operator""_suffix ( const char8_t * , std::size_t ); // C++20
T operator""_suffix ( const char16_t * , std::size_t );
T operator""_suffix ( const char32_t * , std::size_t );

T x = U"42"_suffix;
```

<!-- .element: data-id="code2" -->

---

<!-- .slide: id="string_literals" class="aside" data-auto-animate -->

## Library string literals (C++14)

String literals

```cpp
#include <string>
///hide
#include <iostream>
///unhide

///hide
int main()
{
///unhide
using namespace std::string_literals;
// or using namespace std::literals;

const std::string s1 = "abc\0def";
const std::string s2 = "abc\0def"s;
std::cout << "s1: " << s1.size() << " \"" << s1 << "\"\n";
std::cout << "s2: " << s2.size() << " \"" << s2 << "\"\n";
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: id="complex_literals" class="aside" data-auto-animate -->

## Library string literals (C++14)

Complex literals

```cpp
#include <complex>
///hide
#include <iostream>
///unhide

///hide
int main()
{
///unhide
using namespace std::complex_literals;
// or using namespace std::literals;

const auto c = 1.0 + 1i;
std::cout << "abs" << c << " = " << abs(c) << '\n';
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: id="duration_literals" data-auto-animate -->

## Library string literals (C++14)

Chrono literals

```cpp
#include <chrono>
///hide
#include <iostream>
///unhide

///hide
int main()
{
///unhide
using namespace std::chrono_literals;
// or using namespace std::literals;

auto halfmin = 30s;
std::cout 
  << "half a minute is " << halfmin.count() << " seconds\n";
///hide
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: id="ratio" data-background-image="07_chrono/ratio.gif" -->

<div class="footnote">

Source: [The C++ Standard Library: A Tutorial and Reference, Nicolai Josuttis](https://www.informit.com/articles/article.aspx?p=1881386)

</div>

## `std::ratio`

<!-- .element: class="chapter" -->

---

## compile-time rational number

```cpp
///hide
#include <iostream>
///unhide
#include <ratio>

///hide
int main()
{
///unhide
using FiveThirds = std::ratio<5,3>;
std::cout << FiveThirds::num << "/" << FiveThirds::den << '\n';

using AlsoFiveThirds = std::ratio<25,15>;
std::cout << AlsoFiveThirds::num << "/" << AlsoFiveThirds::den << '\n';

using one = std::ratio<42,42>;
std::cout << one::num << "/" << one::den << '\n';

using zero = std::ratio<0>;
std::cout << zero::num << "/" << zero::den << '\n';

using Neg = std::ratio<7,-3>;
std::cout << Neg::num << "/" << Neg::den << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

## compile-time rational arithmetic

```cpp
///hide
#include <ratio>

///unhide
static_assert(
  std::ratio_equal<
    std::ratio_add<
      std::ratio<1,4>, 
      std::ratio<2,3>
    >::type,
    std::ratio_multiply<
      std::ratio<1, 3>, 
      std::ratio<11, 4>
    >::type
  >::value,
  "rationals FTW"
);
```

---

## compile-time error checks

```cpp
///fails=static assertion failed: overflow in multiplication
///hide
#include <ratio>
#include <limits>

///unhide
std::ratio_multiply<
    std::ratio<1, std::numeric_limits<intmax_t>::max()>,
    std::ratio<1, 2>
>::type; // error: overflow in multiplication

std::ratio_divide<
    std::ratio<1, 2>,
    std::ratio<0>
>::type; // error: denominator cannot be zero
```

---

## predefined ratios

|name|value|name|value|
|----|-----|----|-----|
|`yocto`*|`std::ratio<1, 1000000000000000000000000>`|`deca`|`std::ratio<10, 1>`|
|`zepto`*|`std::ratio<1, 1000000000000000000000>`|`hecto`|`std::ratio<100, 1>`|
|`atto`|`std::ratio<1, 1000000000000000000>`|`kilo`|`std::ratio<1000, 1>`|
|`femto`|`std::ratio<1, 1000000000000000>`|`mega`|`std::ratio<1000000, 1>`|
|`pico`|`std::ratio<1, 1000000000000>`|`giga`|`std::ratio<1000000000, 1>`|
|`nano`|`std::ratio<1, 1000000000>`|`tera`|`std::ratio<1000000000000, 1>`|
|`micro`|`std::ratio<1, 1000000>`|`peta`|`std::ratio<1000000000000000, 1>`|
|`milli`|`std::ratio<1, 1000>`|`exa`|`std::ratio<1000000000000000000, 1>`|
|`centi`|`std::ratio<1, 100>`|`zetta`*|`std::ratio<1000000000000000000000, 1>`|
|`deci`|`std::ratio<1, 10>`|`yotta`*|`std::ratio<1000000000000000000000000, 1>`|

<!-- .element: class="noborder" style="font-size: 0.38em" -->

`*` if `std::intmax_t` can represent the denominator

<!-- .element: style="font-size: 0.5em" -->

---

## `std::chrono::duration`

```cpp
///hide
#include <ratio>

///unhide
template<
  class Rep,
  class Period = std::ratio<1>
> class duration;
```

---

## predefined durations

|name|literal|value|
|----|-------|-----|
|`std::chrono::nanoseconds`|`ns`|`duration<int_least64_t, std::nano>`|
|`std::chrono::microseconds`|`us`|`duration<int_least55_t, std::micro>`|
|`std::chrono::milliseconds`|`ms`|`duration<int_least45_t, std::milli>`|
|`std::chrono::seconds`|`s`|`duration<int_least35_t>`|
|`std::chrono::minutes`|`min`|`duration<int_least29_t, std::ratio<60>>`|
|`std::chrono::hours`|`h`|`duration<int_least23_t, std::ratio<3600>>`|

<!-- .element: class="noborder" style="font-size: 0.5em" -->

`*` some types can use smaller integers

<!-- .element: class="noborder" style="font-size: 0.45em" -->

---

## conversions

lossless conversions are implicit

```cpp
///hide
#include <chrono>

///unhide
using namespace std::chrono_literals;

std::chrono::milliseconds m = 3s; // 3000ms
std::chrono::nanoseconds n = 5h;  // 18000000000000ns
```

---

## conversions

lossy conversions require `duration_cast` (truncates towards zero)

```cpp
///hide
#include <chrono>

///unhide
using namespace std::chrono_literals;
using namespace std::chrono;

auto s = duration_cast<seconds>(3400ms); // 3s
```

---

<!-- .slide: id="chrono_rounding" -->

## more conversions (C++17)

```cpp
///options=-std=c++17
///hide
#include <chrono>
#include <iostream>

int main() {
///unhide
using namespace std::chrono;

std::cout << floor<seconds>(3600ms).count() << '\n';
std::cout << ceil<seconds>(3400ms).count() << '\n';
std::cout << round<seconds>(3600ms).count() << '\n';
std::cout << round<seconds>(3400ms).count() << '\n';
///hide
}
```

Note: Only use an explicit cast when an implicit
conversion won't work.
If the implicit conversion compiles, it will be exact.
Otherwise it won't compile and you can make the
decision of which rounding mode you need

---

## mixed arithmetics

like rational arithmetic

```cpp
///hide
#include <chrono>
#include <cassert>

int main() {
///unhide
using namespace std::chrono_literals;

assert(30ms - 1100us == 28900us);
assert(500ms + 2500000us == 3s);
///hide
}
```

---

## custom representations

users can use any arithmetics type as the underlying represenations

```cpp
///hide
#include <chrono>
#include <iostream>

int main() {
using namespace std::chrono_literals;
///unhide
using seconds32 = std::chrono::duration<uint32_t>;
using fseconds = std::chrono::duration<float>;

fseconds f = 45ms;
std::cout << f.count() << "s\n"; // 0.045s
///hide
}
```

Note: `duration_cast` is not needed on floating point representation.

---

## custom durations

```cpp
///hide
#include <chrono>
#include <iostream>

int main() {
///unhide
using namespace std;

using frames = chrono::duration<int32_t, ratio<1, 60>>;
using fmillis = chrono::duration<float, milli>;

fmillis f = 45ms + frames{5};
std::cout << f.count() << "ms\n"; // 128.333ms
///hide
}
```

---

<!-- .slide: data-background-image="07_chrono/second.gif" data-background-size="contain" -->

## `time points and clocks`

<!-- .element: class="chapter" -->

---

## `std::chrono::time_point`

A specific point in time, with respect to some clock, which has a precision of some duration

```cpp
template <
  class Clock, 
  class Duration = typename Clock::duration
> class time_point;
```

---

## clock

a bundle of a duration, a time_point and a static function to get the current time.

```cpp
///hide
#include <chrono>

namespace chrono = std::chrono;

///unhide
struct some_clock
{
  using duration = chrono::duration<int64_t, std::micro>;
  using rep = duration::rep;
  using period = duration::period;
  using time_point = chrono::time_point<some_clock>;

  static constexpr bool is_steady = false;

  static time_point now() noexcept;
};
```

---

## standard clocks

- `std::chrono::system_clock` for wall-clock time (what time of day is it?)
- `std::chrono::steady_clock` for duration measurements

---

## duration vs. time point

`10000s` means **any** 10,000 seconds, but

```cpp
///hide
#include <chrono>

void foo() {
namespace chrono = std::chrono;
using namespace std::chrono_literals;
///unhide
chrono::time_point<chrono::system_clock, chrono::seconds>{10000s};
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

means 

1970-01-01 02:46:40 UTC

---

## time point conversions

lossless is implicit, lossy with `time_point_cast`

```cpp
///hide
#include <chrono>

using namespace std::chrono_literals;
///unhide
using namespace std::chrono;
template <class D>
using sys_time = time_point<system_clock, D>;

sys_time<milliseconds> tpm = sys_time<seconds>{5s};
sys_time<seconds> tps = time_point_cast<seconds>(tpm);
```

time_points associated with different clocks
**do not** convert to one another.

---

## time point arithmetic

substracting two time points yields a duration

```cpp
///hide
#include <chrono>
#include <iostream>

int main() {
using namespace std::chrono;
using namespace std::chrono_literals;
///unhide
const auto start = steady_clock::now();
system_clock::now();
const auto end = steady_clock::now();
auto d = duration_cast<microseconds>(end - start);
std::cout 
  << "getting time of day took " 
  << d.count() << "us\n";
///hide
}
```

---

<!-- .slide: data-background-image="07_chrono/thanks.gif" -->