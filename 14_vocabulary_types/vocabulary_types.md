<!-- .slide: data-background-image="14_vocabulary_types/cruyff.png" -->

---

<!-- .slide: data-background-image="14_vocabulary_types/typing.gif" -->

## C++17 Vocabulary Types

<!-- .element: class="chapter bottom" -->

---

> One of the important roles of a [...] standard library is to provide vocabulary types. 
> A "vocabulary" type is a type that purports to provide a single **lingua franca**, a common language, for dealing with its domain.
>
> <cite>Arthur O'Dwyer</cite>

---

<!-- .slide: data-background-image="14_vocabulary_types/strings.gif" -->

## strings

<!-- .element: class="chapter bottom" -->

<div class="footnotes">

Sources: 

- [N3921](https://wg21.link/n3921), Jeffrey Yasskin
- [Mastering the C++17 STL](https://www.packtpub.com/product/mastering-the-c-17-stl/9781787126824), Arthur O'Dwyer

</div>


---

## At the beginning there was `char*`

```cpp
///hide
#include <cstring>
#include <cstdio>

///unhide
char* greet(const char* name) {
  char buffer[100];
  snprintf(buffer, 100, "hello %s", name);
  return strdup(buffer);
}
```

- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  Input string must be null terminated.
- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  Input string cannot include embedded nulls.
- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  Input length needs to be calculated linearly.
- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  Caller has to deal with return value lifetime.

Note: another alternative is to take input buffer as `snprintf` and hope it is big enough


---

## use `std::string`?

```cpp
///hide
#include <string>

///unhide
std::string greet(const std::string& name) {
  using namespace std::literals;
  return "hello "s.append(name);
}
```

- [x] <!-- .element: class="fragment" data-fragment-index="0" -->  simpler implementation
- [x] <!-- .element: class="fragment" data-fragment-index="0" -->  knows its size
- [x] <!-- .element: class="fragment" data-fragment-index="0" -->  manages its own lifetime
- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  requires allocation + copy when passed a <code>char*</code>

---

## add `char*` + length overload?

```cpp
///hide
#include <string>

///unhide
std::string greet(const char* name, size_t length) {
  using namespace std::literals;
  return "hello "s.append(name, length);
}

std::string greet(const std::string& name) {
  return greet(name.c_str(), name.length());
}
```

- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  requires maintaining two overloads
- [ ] <!-- .element: class="fragment" data-fragment-index="0" -->  looses <code>std::string</code>'s reach API

---

## use `std::string_view`!

```cpp
///options+=-std=c++17
///hide
#include <iostream>
#include <string>
///unhide
#include <string_view>

std::string greet(std::string_view name) {
  using namespace std::literals;
  return "hello "s.append(name);
}

///hide
int main() {
///unhide
using namespace std::literals;
std::cout << greet("char array") << '\n';
std::cout << greet("std::string"s) << '\n';
std::cout << greet("std::string_view"sv) << '\n';
///hide
}
```

- [x] <!-- .element: class="fragment" data-fragment-index="0" -->  no copy or allocation
- [x] <!-- .element: class="fragment" data-fragment-index="0" -->  reach API

---

## even non standard strings

```cpp [2,4,9-10]
///external
///options+=-std=c++17
///libs=eastl:trunk
///hide
#include <iostream>
#include <string>
///unhide
#include <string_view>
#include <EASTL/string.h>

std::string greet(std::string_view name) {
  using namespace std::literals;
  return "hello "s.append(name);
}

///hide
void* operator new[](size_t size, const char* name, int flags,
                     unsigned debugFlags, const char* file, int line) {
  return new uint8_t[size];
}

int main() {
///unhide
const eastl::string str = "eastl::string";
std::cout << greet({str.data(), str.size()}) << '\n';
///hide
}
```

---

## rich API

```cpp [|7,8,11]
///options+=-std=c++17
///hide
#include <string_view>
#include <vector>

///unhide
std::vector<std::string_view> 
split(const std::string_view& str, 
      const std::string_view& delims = " ")
{
    std::vector<std::string_view> output;

    for (size_t first = 0; first < str.size();) {
        const auto second = str.find_first_of(delims, first);

        if (first != second)
            output.emplace_back(str.substr(first, second-first));

        first = second + 1;
    }

    return output;
}
```

<!-- .element: style="font-size: 0.45em" -->

---

## read only

```cpp
///options+=-std=c++17
///hide
#include <iostream>
#include <string_view>
#include <string>
int main()
{
///unhide
std::string str = "Exemplar";
std::string_view v = str;
std::cout << v[2] << '\n';
//  v[2] = 'y'; // Error: cannot modify through a string view
str[2] = 'y';
std::cout << v[2] << '\n';
///hide
}
```

---

## reference semantics

```cpp
///options+=-std=c++17
///hide
#include <string>
#include <string_view>

using namespace std::literals;
///unhide
std::string_view bad("a temporary string"s);
```

---

## not necessarily null-terminated

```cpp
///options+=-std=c++17
///hide
#include <string_view>
#include <cstring>

///unhide
auto string_size(std::string_view str) {
  return strlen(str.data());
}

int main() {
  char array[] = {'a', 'b', 'c'};
  return string_size({array, std::size(array)}); // oops
}
```

---

## benchmark

[![split benchmark](14_vocabulary_types/split.png)](https://quick-bench.com/q/qb8GrTTCPYthl_lyfe0C0zbqM40)

---

<!-- .slide: class="aside" -->

## What is a type?

- The set of values that can inhabit an expression
- May be finite or "infinite"
- Characterized by cardinality
- Expressions have types
- A program has a type

Source: [Using Types Effectively](https://www.youtube.com/watch?v=ojZbFIQSdl8), Ben Deane, CppCon 2016

<!-- .element: class="footnote" -->

---

<!-- .slide: class="aside" -->

## LET'S PLAY A GAME

To help us get thinking about types.

I'll tell you a type.

You tell me how many values it has.

There are no tricks: if it seems obvious, it is!

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 1

How many values?

```cpp
///options+=-fpermissive
bool;
```

2 (true and false)

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 1

How many values?

```cpp
///options+=-fpermissive
void;
```

0

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 1

How many values?

```cpp
///hide
#include <cstdint>

///unhide
enum FireSwampDangers : int8_t {
  FLAME_SPURTS,
  LIGHTNING_SAND,
  ROUSES
};
```

3

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 1

How many values?

```cpp
///hide
#include <cstdint>

///unhide
template <typename T>
struct Foo {
  T m_t;
};
```

As much as `T`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" -->

# END OF LEVEL 1

---

<!-- .slide: id="optional" -->

## optional

<!-- .element: class="chapter" -->

![optional](14_vocabulary_types/optional.gif) <!-- .element: style="width: 100%" -->

Source: [N3672](https://wg21.link/n3672), Fernando Cacciola & Andrzej Krzemieński

<!-- .element: class="footnote" -->

---

## sentinel values

```cpp
///hide
struct Person {
  int age;
};

///unhide
int getAge(Person* person) {
  if (person) {
    return person->age;
  }
  return -1;
}
```

---

## sentinel values

```cpp
///hide
struct Account {
  int balance;
};

///unhide
int getBalance(Account* account) {
  if (account) {
    return account->balance;
  }
  return {/*WHAT?*/};
}
```

---

## output params?

```cpp
///hide
struct Account {
  int balance = 42;
};

///unhide
int getBalance(Account* account, bool& ok) {
  if (account) {
    ok = true;
    return account->balance;
  }
  ok = false;
  return 0;
}

///hide
int main() {
Account account;
///unhide
bool ok;
auto balance = getBalance(&account, ok);
if (ok) {
  // do something with balance
}
///hide
}
```

Note: 
- flag is easily ignored
- forces caller to declare another lvalue (even if they know the value is there). 
- flag and value are not coupled.
- what if there's more then one return value.

---

## `std::optional`

```cpp [1|3-8|10-12]
///options+=-std=c++17
///output=balance = 42
#include <optional>
///hide
#include <iostream>

struct Account {
  int balance = 42;
};
///unhide

std::optional<int> getBalance(Account* account) {
  if (account) {
    return account->balance;
  }
  return std::nullopt;
}

///hide
int main() {
Account account;
///unhide
if (auto balance = getBalance(&account)) {
  std::cout << "balance = " << *balance;
}
///hide
}
```

---

<!-- .slide: data-auto-animate -->

## 3 ways to get a value

```cpp []
///options+=-std=c++17
///hide
#include <optional>

struct Account {
  int balance = 42;
};

///unhide
std::optional<int> getBalance(Account* account);

int doGetBalance(Account& account) {
  return *getBalance(&account);
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## 3 ways to get a value

```cpp []
///options+=-std=c++17
///hide
#include <optional>
#include <iostream>

struct Account {
  int balance = 42;
};

///unhide
std::optional<int> getBalance(Account* account);

int doGetBalance(Account& account) {
  try {
    return getBalance(&account).value();
  } catch (const std::bad_optional_access& e) {
    std::cerr << e.what() << '\n';
    return 0;
  }
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## 3 ways to get a value

```cpp []
///options+=-std=c++17
///hide
#include <optional>

struct Account {
  int balance = 42;
};

///unhide
std::optional<int> getBalance(Account* account);

int doGetBalance(Account& account) {
  return getBalance(&account).value_or(0);
}
```

<!-- .element: data-id="code" -->

---

## a different implementation

```cpp
///options+=-std=c++17
///hide
#include <optional>

struct Account {
  int balance = 42;
};

///unhide
std::optional<int> getBalance(Account* account) {
  std::optional<int> res;
  if (account) {
    res = account->balance;
  }
  return res;
}
```

Note: `optional<T>` is always default constructible and copy/move assignable when `T` is

---

## lazy loading

```cpp
///options+=-std=c++17
///hide
#include <optional>
#include <mutex>

struct Resource{
  Resource(const char*, const char*);
};

///unhide
class Widget
{
  mutable std::mutex m_;
  mutable std::optional<const Resource> resource_;

public:
  const Resource& getResource() const {
    std::lock_guard<std::mutex> lg{m_};
    if (resource_ == std::nullopt)
        resource_.emplace("resource", "arguments");

    return *resource_;
  }
};
```

Note: `emplace` destructs any contained value and construct a new one by forwarding the arguments

---

## optional argument

```cpp
///options+=-std=c++17
///hide
#include <optional>

///unhide
template <typename T>
T getValue(std::optional<T> newVal = {})
{
  static T cached{};
  if (newVal) {
    cached = *newVal;
  }
  return cached;      
}
```

---

## in-place construction

```cpp
///options+=-std=c++17
///hide
#include <string>
#include <optional>
#include <cassert>

int main() {
///unhide
std::optional<std::string> o1{std::in_place, {'a', 'b', 'c'}};
assert(o1 == "abc");

std::optional<std::string> o2{std::in_place, 3, 'A'};
assert(o2 == "AAA");
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: can construct non-movable types and saves constructing a temporary and moving it in for movable types

---

## alternatively

```cpp
///options+=-std=c++17
///hide
#include <string>
#include <optional>
#include <cassert>

int main() {
using namespace std::literals;
///unhide
auto o1 = std::make_optional<std::string>({'a', 'b', 'c'});
assert(o1 == "abc");

auto o2 = std::make_optional<std::string>(3, 'A');
assert(o2 == "AAA");

auto o3 = std::make_optional("123"s);
static_assert(std::is_same_v<decltype(o3), std::optional<std::string>>);
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

---

## no optional references

```cpp
///options+=-std=c++17
///fails=static_assert(!is_reference_v<_Tp>)
///hide
#include <optional>

int main() {
///unhide
int i = 1;
int j = 2;
std::optional<int&> ora = i;
ora = j; // assigns or rebinds
///hide
}
```

---

## use `std::reference_wrapper`

```cpp
///options+=-std=c++17
///hide
#include <optional>
#include <cassert>
#include <functional>

int main() {
///unhide
int i = 1;
int j = 2;
std::optional<std::reference_wrapper<int>> ora = i;
ora = j; // rebinds
assert(&ora->get() == &j);
///hide
}
```

Note: notice call to `operator->`

---

<!-- .slide: class="aside" -->

## Algebraic data types

Algebraically, a type is the number of values that inhabit it.

These types are equivalent:

```cpp
///options+=-fpermissive
bool;
enum class InatorButtons {
  ON_OFF,
  SELF_DESTRUCT
};
```

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 2

How many values?

```cpp
///options+=-fpermissive
///hide
#include <utility>

///unhide
std::pair<char, bool>;
```

`$$ 256 \cdot 2 = 512 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 2

How many values?

```cpp
struct Foo {
  char a;
  bool b;
};
```

`$$ 256 \cdot 2 = 512 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 2

How many values?

```cpp
///options+=-fpermissive
///hide
#include <tuple>

///unhide
std::tuple<bool, bool, bool>;
```

`$$ 2 \cdot 2 \cdot 2 = 8 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 2

How many values?

```cpp
template <typename T, typename U>
struct Foo {
  T m_t;
  U m_u;
};
```

`$$ |T| \cdot |U| $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" -->

## product types

- When two types are "concatenated" into one compound type, we multiply the # of inhabitants of the components.
- This kind of compounding gives us a product type

---

<!-- .slide: class="aside" -->

# END OF LEVEL 2

---

<!-- .slide: data-background-image="14_vocabulary_types/good.gif" -->

---

<!-- .slide: id="variant" data-background-image="14_vocabulary_types/variant.gif" -->

## variant

<!-- .element: class="chapter bottom" -->

Source: [P0088R3](http://wg21.link/p0088r3), Axel Naumann

<!-- .element: class="footnote" -->

Note: we will take a look at some use cases for variant

---

## network connection

FILE: 14_vocabulary_types/state_machine.svg

Source: [Using Types Effectively](https://www.youtube.com/watch?v=ojZbFIQSdl8), Ben Deane, CppCon 2016

<!-- .element: class="footnote" -->

Note: network connections are implemented many times using a state machine similar to the one presented here. some of the states have data fields relevant to those states.

---

## a connection

```cpp [1-8,15|9|10-14]
///options+=-std=c++17
///hide
#include <chrono>
#include <string>
#include <optional>

struct ConnectionId {};
struct Timer {};

///unhide
struct Connection {
  enum class State {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    CONNECTION_INTERRUPTED
  };
  State m_state = State::DISCONNECTED;
  std::string m_serverAddress;
  ConnectionId m_id;
  std::chrono::system_clock::time_point m_connectedTime;
  std::optional<std::chrono::milliseconds> m_lastPingTime;
  std::chrono::system_clock::time_point m_disconnectedTime;
  Timer m_reconnectTimer;
};
```

<!-- .element: style="font-size: 0.5em" -->

Note: here is a naive implementation of such a connection holding a current state field, server address, which, for the sake of discussion, is relevant to all states and state specific data fields.

---

## state transitions

```cpp [1-16|18-21]
///options+=-std=c++17
///hide
#include <chrono>
#include <string>
#include <optional>

struct ConnectionId {};
struct Timer {
    Timer(size_t);
};

struct Connection {
  enum class State {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    CONNECTION_INTERRUPTED
  };
  std::string m_serverAddress;
  ConnectionId m_id;
  std::chrono::system_clock::time_point m_connectedTime;
  std::optional<std::chrono::milliseconds> m_lastPingTime;
  std::chrono::system_clock::time_point m_disconnectedTime;
  Timer m_reconnectTimer;
  State m_state = State::DISCONNECTED;

  void notifyInterrupted(std::chrono::system_clock::time_point);

///unhide
void interrupt() {
  switch (m_state) {
    case State::DISCONNECTED:
    case State::CONNECTING:
      m_state = State::DISCONNECTED;
      break;
    case State::CONNECTED:
      m_disconnectedTime = std::chrono::system_clock::now();
      notifyInterrupted(m_disconnectedTime);
      m_reconnectTimer = Timer{5000};
      m_state = State::CONNECTION_INTERRUPTED;
      break;
    case State::CONNECTION_INTERRUPTED:
      break;
  }
}

void disconnect() {
  // maybe need to kill timer?
  m_state = State::DISCONNECTED;
}
///hide
};
```

<!-- .element: style="font-size: 0.5em" -->

Note:

- Data is accessible where it shouldn’t be
- not RAII as state stays alive when not needed
- We want to make illegal states unrepresentable

---

## `std::variant`

```cpp [1-3|5-6|8-13|15-19|21|23-24]
///options+=-std=c++17
///output=42\nstd::get: wrong index for variant\nwe don't have a string\nforty two
///hide
#include <iostream>
///unhide
#include <variant>

///hide
int main() {
///unhide
std::variant<int, std::string> v;

v = 42;
std::cout << std::get<int>(v) << '\n';

try {
  std::cout << std::get<std::string>(v) << '\n';
}
catch (const std::bad_variant_access &e) {
  std::cout << e.what() << '\n';
}

if (auto p = std::get_if<std::string>(&v)) {
  std::cout << "we have a string: " << *p << '\n';}
else {
  std::cout << "we don't have a string\n";
}

// std::cout << std::get<long>(v) << '\n';

v = "forty two";
std::cout << std::get<std::string>(v) << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: 

- a variant can hold one of a predefined list of types, `int` and `string` in this example.
- you can think of it as a type-safe union.
- can't get `long` even though `int` implicitly converts to it.

---

## in-place construction

```cpp [1-5|1,7-9|1,11]
///options+=-std=c++17
///hide
#include <string>
#include <variant>
#include <cassert>
#include <vector>

int main() {
///unhide
using Var = std::variant<std::string, std::vector<int>, float>;

Var var{std::in_place_type<std::string>, 4, 'A'};
assert(var.index() == 0);
assert(std::get<0>(var) == "AAAA");

var = Var{std::in_place_index<1>, {1, 2, 3}};
assert(std::holds_alternative<std::vector<int>>(var));
assert(std::get<std::vector<int>>(var).size() == 3);

var.emplace<float>(4.2);
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: can construct non-movable types and saves constructing a temporary and moving it in for movable types

---

## visiting

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <string>

///unhide
using Var = std::variant<int, std::string>;

Var duplicate(const Var& v) {
  struct Duplicater {
    Var operator()(int i) { return i * 2; }
    Var operator()(const std::string &s) {
    return s + s;
    }
  };
  return std::visit(Duplicater{}, v);
}
```

Note: the main way to interact with variants is std::visit. it accepts a callable with multiple call operators and call one of them based on the current value of the variant. all visitors should have the same return type and there should be a single visitor matching each variant type.

---

## overload set - C++14

```cpp [1-3,21|5-10|12-20|23-26]
///hide
#include <utility>

///unhide
namespace impl {
template <typename...>
struct overload_set;

template <typename F>
struct overload_set<F> : F {
  using F::operator();

  overload_set(F &&f) noexcept : F(std::forward<F>(f)) {}
};

template <typename F, typename... Fs>
struct overload_set<F, Fs...> : F, overload_set<Fs...> {
  overload_set(F&& f, Fs&&... fs) noexcept
      : F(std::forward<F>(f)),
        overload_set<Fs...>(std::forward<Fs>(fs)...) {}

  using F::operator();
  using overload_set<Fs...>::operator();
};
}  // namespace impl

template <typename... Fs>
auto overload(Fs&&... fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}
///hide

auto x = overload([]{ return 42; })();
```

<!-- .element: style="font-size: 0.5em" -->

Note: we would like to use lambdas for visiting variants instead of ad-hoc function objects.

---

## overload set - C++17

```cpp []
///options+=-std=c++17
///hide
#include <utility>

///unhide
namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs&&... fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs&&... fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}
///hide

static_assert(overload([]{ return 42; })() == 42);
```

<!-- .element: style="font-size: 0.5em" -->

Note: `constexpr` lambda + variadic using

---

## lambda visitation

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <utility>
#include <string>

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}
///unhide
using Var = std::variant<int, std::string>;

Var duplicate(const Var& v) {
  return std::visit(overload(
    [](int i) -> Var { return i * 2; },
    [](const std::string &s) -> Var { return s + s; }
  ), v);
}
```

---

## explicit return type (C++20)

```cpp
///options+=-std=c++2a
///hide
#include <variant>
#include <utility>
#include <string>

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}
///unhide
using Var = std::variant<int, std::string>;

Var duplicate(const Var& v) {
  return std::visit<Var>(overload(
    [](int i) { return i * 2; },
    [](const std::string &s) { return s + s; }
  ), v);
}
```

Note: we define the return type once on `std::visit`

---

## `constexpr if` &nbsp; visitation

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <string>
#include <type_traits>

///unhide
using Var = std::variant<int, std::string>;

Var duplicate(const Var& v) {
  return std::visit([](const auto& value)->Var {
    if constexpr (std::is_same_v<decltype(value), int>) {
      return value * 2; 
    } else {
      return value + value;
    }
  }, v);
}
```

---

## back to connection

```cpp [13-15|2-12|16]
///options+=-std=c++17
///hide
#include <chrono>
#include <string>
#include <optional>
#include <variant>

struct ConnectionId {};
struct Timer {};

///unhide
struct Connection {
  struct Disconnected {};
  struct Connecting {};
  struct Connected {
    ConnectionId m_id;
    std::chrono::system_clock::time_point m_connectedTime;
    std::optional<std::chrono::milliseconds> m_lastPingTime;
  };
  struct ConnectionInterrupted {
    std::chrono::system_clock::time_point m_disconnectedTime;
    Timer m_reconnectTimer;
  };
  using State =
  std::variant<Disconnected, Connecting, Connected, ConnectionInterrupted>;
  State m_state;
  std::string m_serverAddress;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

## state transition

```cpp [1-2,10-11|3-7|8|9]
///options+=-std=c++17
///hide
#include <chrono>
#include <string>
#include <optional>
#include <variant>

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

struct ConnectionId {};
struct Timer {
  Timer(size_t);
};

struct Connection {
  struct Disconnected {};
  struct Connecting {};
  struct Connected {
    ConnectionId m_id;
    std::chrono::system_clock::time_point m_connectedTime;
    std::optional<std::chrono::milliseconds> m_lastPingTime;
  };
  struct ConnectionInterrupted {
    std::chrono::system_clock::time_point m_disconnectedTime;
    Timer m_reconnectTimer;
  };
  using State =
  std::variant<Disconnected, Connecting, Connected, ConnectionInterrupted>;
  State m_state;
  std::string m_serverAddress;

  void notifyInterrupted(std::chrono::system_clock::time_point);

///unhide
void interrupt() {
  m_state = std::visit(overload(
    [this](const Connected &) -> State {
      const auto now = std::chrono::system_clock::now();
      notifyInterrupted(now);
      return ConnectionInterrupted{now, 5000};
    },
    [](const ConnectionInterrupted &s) -> State { return s; },
    [](const auto & /*default*/) -> State { return Disconnected(); }
  ), m_state);
}
///hide
};
```

<!-- .element: style="font-size: 0.45em" -->

Note: each state can only access its own fields, and those fields are destroyed when state is transitioned.

---

## json

<div class="split">

<div>

- Null
- Number
- String
- Boolean
- Array of JSON
- Map of string -> JSON

</div>

```json
///fails=expected unqualified-id before '{' token
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "spouse": null
}
```

<div>

Note: you are all familiar with the JSON format in which every value can be one of this list of types. you can see an example of a JSON object describing some person. It is very natural to represent such types with a variant.

---

## recursive variant

```cpp
///options+=-std=c++17
///fails='JsonValue' was not declared in this scope
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>

///unhide
using JsonValue = std::variant<
  nullptr_t,                        // null
  int,                              // number
  std::string,                      // string
  bool,                             // boolean
  std::vector<JsonValue>,           // array
  std::map<std::string, JsonValue>  // object
>;
```

Note: does not compile

---

## Fundamental theorem of software engineering

> We can solve any problem by introducing an extra level of indirection.
>
> <cite>Andrew Koenig</cite>

---

#### containers of incomplete types (C++17)

```cpp [1-3|4-10|11-14]
///options+=-std=c++17
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>

///unhide
struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;
using Base = std::variant<std::nullptr_t, // null
                          int,            // number
                          std::string,    // string
                          bool,           // boolean
                          JsonArray,      // array
                          JsonObject      // object
                          >;
struct JsonValue : Base
{
  using Base::Base;
};
```

<!-- .element: style="font-size: 0.45em" -->

Note: luckily, C++17 also enables having containers of incomplete types.

---

## tests

```cpp []
///options+=-std=c++17
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>
#include <cassert>

struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;
using Base = std::variant<std::nullptr_t, // null
                          int,            // number
                          std::string,    // string
                          bool,           // boolean
                          JsonArray,      // array
                          JsonObject      // object
                          >;
struct JsonValue : Base
{
  using Base::Base;
};
int main() {
///unhide
assert(std::holds_alternative<std::nullptr_t>(JsonValue{nullptr}));
assert(std::holds_alternative<int>(JsonValue{42}));
assert(std::holds_alternative<std::string>(JsonValue{"hello"}));
assert(std::holds_alternative<bool>(JsonValue{true}));
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: constructing a JsonValue with each of the simple types correctly sets the variant type

---

## more tests

```cpp []
///options+=-std=c++17
///fails=no matching function for call to 'JsonValue::JsonValue(<brace-enclosed initializer list>)'
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>
#include <cassert>

struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;
using Base = std::variant<std::nullptr_t, // null
                          int,            // number
                          std::string,    // string
                          bool,           // boolean
                          JsonArray,      // array
                          JsonObject      // object
                          >;
struct JsonValue : Base
{
  using Base::Base;
};
int main() {
///unhide
assert(std::holds_alternative<JsonArray>(JsonValue{1, "goodbye"}));
assert(std::holds_alternative<JsonObject>(JsonValue{{"1", "goodbye"}}));
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: trying to construct the compound types fails to compile because the compiler can't deduce the requested type

---

## add a constructor

```cpp [5-6|9-10,32|11-17|19-29|31|35-36]
///options+=-std=c++17
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>
#include <algorithm>
#include <cassert>

struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;
using Base = std::variant<std::nullptr_t, // null
                          int,            // number
                          std::string,    // string
                          bool,           // boolean
                          JsonArray,      // array
                          JsonObject      // object
                          >;
///unhide
struct JsonValue : Base
{
  using Base::Base;

  JsonValue(std::initializer_list<JsonValue> init) 
  : Base{fromInitList(init)} {}

private:
  static Base fromInitList(std::initializer_list<JsonValue> init)
  {
    auto isObject = std::all_of(init.begin(), init.end(), 
                                [](const JsonValue &v) {
      auto asArray = std::get_if<JsonArray>(&v);
      return asArray 
        && asArray->size() == 2 
        && std::holds_alternative<std::string>(asArray->at(0));
    });

    if (isObject)
    {
      JsonObject obj;
      std::transform(init.begin(), init.end(), std::inserter(obj, obj.end()), 
                     [](const JsonValue &v) {
        auto asArray = std::get<JsonArray>(v);
        return std::make_pair(std::get<std::string>(asArray[0]), 
                              asArray[1]);
      });
      return obj;
    }

    return JsonArray{init.begin(), init.end()};
  }
};

///hide
int main() {
///unhide
assert(std::holds_alternative<JsonArray>(JsonValue{1, "goodbye"}));
assert(std::holds_alternative<JsonObject>(JsonValue{{"1", "goodbye"}}));
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

## JSON readability

<div class="split">

```json
///fails=expected unqualified-id before '{' token
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "spouse": null
}
```

```cpp
///options+=-std=c++17
///hide
#include <map>
#include <string>
#include <variant>
#include <vector>

struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;
using Base = std::variant<std::nullptr_t, // null
                          int,            // number
                          std::string,    // string
                          bool,           // boolean
                          JsonArray,      // array
                          JsonObject      // object
                          >;
struct JsonValue : Base
{
  using Base::Base;

  JsonValue(std::initializer_list<JsonValue> init);
};

///unhide
JsonValue person{
      {"firstName", "John"},
      {"lastName", "Smith"},
      {"isAlive", true},
      {"age", 27},
      {"address", {
          {"streetAddress", "21 2nd Street"}, 
          {"city", "New York"}
        }
      },
      {"phoneNumbers", {
        {
          {"type", "home"}, 
          {"number", "212 555-1234"}
        },
        {
          {"type", "office"}, 
          {"number", "646 555-4567"}}
        },
      },
      {"spouse", nullptr}
    };
```

</div>

---

> Inheritance is the base class of evil
>
> <cite>Sean Parent</cite>

---

## inheritance - base class

```cpp
struct Shape {
  virtual double area() const = 0;
  virtual ~Shape() = default;
};
```

---

## inheritance - derived classes

```cpp
///hide
#include <cmath>
    
static const auto PI = acos(-1);

struct Shape {
  virtual double area() const = 0;
  virtual ~Shape() = default;
};

///unhide
struct Square final : Shape {
  explicit Square(double length) : length{ length } {}
  double area() const override { return length * length; }
  double length;
};

struct Circle final : Shape {
  explicit Circle(double radius) : radius{ radius } {}
  double area() const override {
    return PI * radius * radius;
  }
  double radius;
};
```

Note: forces all participant types to inherit from base type

---

## inheritance - usage

```cpp
///hide
#include <cmath>
#include <cassert>
#include <numeric>
#include <memory>
    
static const auto PI = acos(-1);

struct Shape {
  virtual double area() const = 0;
  virtual ~Shape() = default;
};

struct Square final : Shape {
  explicit Square(double length) : length{ length } {}
  double area() const override { return length * length; }
  double length;
};

struct Circle final : Shape {
  explicit Circle(double radius) : radius{ radius } {}
  double area() const override {
    return PI * radius * radius;
  }
  double radius;
};

int main() {
///unhide
const std::unique_ptr<Shape> shapes[] = {
  std::make_unique<Square>(4),
  std::make_unique<Circle>(2)
};

const auto areaSum = 
  std::accumulate(std::begin(shapes), std::end(shapes), 0.0,
                  [](double current, const auto& shape) {
                    return current + shape->area();
                  });
assert(areaSum == 16 + 4 * PI);
///hide
}
```

Note: forces heap allocation and pointer semantics

---

## variant - classes

```cpp
///options+=-std=c++17
///hide
#include <variant>

///unhide
struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

using Shape = std::variant<Square, Circle>;
```

Note: types are less coupled

---

## variant - behavior

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <cmath>
    
static const auto PI = acos(-1);

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

using Shape = std::variant<Square, Circle>;

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

///unhide
double area(const Shape &shape) {
  return std::visit(overload(
      [](const Square &square) { return square.length * square.length; },
      [](const Circle &circle) { return PI * circle.radius * circle.radius; }
    ), shape);
}
```

<!-- .element: style="font-size: 0.4em" -->

Note: we could have here even have some library types which we don't control or even primitive types

---

## variant - usage

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <cmath>
#include <numeric>
#include <cassert>
#include <iterator>
    
static const auto PI = acos(-1);

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

using Shape = std::variant<Square, Circle>;

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

double area(const Shape &shape) {
  return std::visit(overload(
    [](const Square &square) { 
      return square.length * square.length; 
    },
    [](const Circle &circle) {
      return PI * circle.radius * circle.radius;
    }),
  shape);
}

int main() {
///unhide
const Shape shapes[] = {Square{4}, Circle{2}};

const auto areaSum = 
  std::accumulate(std::begin(shapes), std::end(shapes), 0.0,
                  [](double current, const auto& shape) {
                    return current + area(shape);
                  });
assert(areaSum == 16 + 4 * PI);
///hide
}
```

Note: no heap allocation, value semantics

---

## inheritance – adding functionality

```cpp [3,10,17]
///hide
#include <cmath>
    
static const auto PI = acos(-1);

///unhide
struct Shape {
  virtual double area() const = 0;
  virtual double perimeter() const = 0;
  virtual ~Shape() = default;
};

struct Square final : Shape {
  explicit Square(double length) : length{ length } {}
  double area() const override { return length * length; }
  double perimeter() const override { return 4 * length; }
  double length;
};

struct Circle final : Shape {
  explicit Circle(double radius) : radius{ radius } {}
  double area() const override { return PI * radius * radius; }
  double perimeter() const override { return 2 * PI * radius; }
  double radius;
};
```

<!-- .element: style="font-size: 0.4em" -->

---

## variant – adding functionality

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <cmath>
    
static const auto PI = acos(-1);

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

using Shape = std::variant<Square, Circle>;

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

///unhide
double perimeter(const Shape &shape) {
  return std::visit(overload(
    [](const Square &square) { return 4 * square.length; },
    [](const Circle &circle) { return 2 * PI * circle.radius; }
    ), shape);
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: no need to change the types

---

## inheritance – adding type

```cpp
///hide
struct Shape {
  virtual double area() const = 0;
  virtual ~Shape() = default;
};

///unhide
struct Triangle : Shape {
  Triangle(double base, double height) : base{base}, height{height} {}
  double area() const override { return base * height / 2; }
  double base, height;
};
```

<!-- .element: style="font-size: 0.45em" -->

---

## variant - adding type

```cpp
///options+=-std=c++17
///hide
#include <variant>

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

///unhide
struct Triangle {
  Triangle(double base, double height) : base{base}, height{height} {}
  double base, height;
};

using Shape = std::variant<Square, Circle, Triangle>;
```

<!-- .element: style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## compiler to the rescue

```cpp
///options+=-std=c++17
///fails=no matching function for call to '__invoke(impl::overload_set<area(const Shape&)::<lambda(const Square&)>, area(const Shape&)::<lambda(const Circle&)> >, const Triangle&)'
///hide
#include <variant>
#include <cmath>
    
static const auto PI = acos(-1);

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

struct Triangle {
  Triangle(double base, double height) : base{base}, height{height} {}
  double base, height;
};

using Shape = std::variant<Square, Circle, Triangle>;

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

///unhide
double area(const Shape &shape) {
  return std::visit(overload(
      [](const Square &square) { return square.length * square.length; },
      [](const Circle &circle) { return PI * circle.radius * circle.radius; }
    ), shape);
}
```

<!-- .element: data-id="code" style="font-size: 0.4em" -->

---

<!-- .slide: data-auto-animate -->

## compiler to the rescue

```cpp
///options+=-std=c++17
///hide
#include <variant>
#include <cmath>
    
static const auto PI = acos(-1);

struct Square {
  explicit Square(double length) : length{length} {}
  double length;
};

struct Circle {
  explicit Circle(double radius) : radius{radius} {}
  double radius;
};

struct Triangle {
  Triangle(double base, double height) : base{base}, height{height} {}
  double base, height;
};

using Shape = std::variant<Square, Circle, Triangle>;

namespace impl {
template <typename... Fs>
struct overload_set : Fs... {
  constexpr overload_set(Fs &&...fs) noexcept
      : Fs(std::forward<Fs>(fs))... {}

  using Fs::operator()...;
};
}  // namespace impl

template <typename... Fs>
constexpr auto overload(Fs &&...fs) noexcept {
  return impl::overload_set<Fs...>{std::forward<Fs>(fs)...};
}

///unhide
double area(const Shape &shape) {
  return std::visit(overload(
      [](const Square &square) { return square.length * square.length; },
      [](const Circle &circle) { return PI * circle.radius * circle.radius; },
      [](const Triangle& triangle) { return triangle.base * triangle.height / 2; }
    ), shape);
}
```

<!-- .element: data-id="code" style="font-size: 0.4em" -->

---

| Inheritance | std::variant |
|-------------|--------------|
| Need not know all the derived types upfront (open-world assumption) | Must know all the cases upfront (closed-world assumption) |
| Dynamic Allocation (usually) | No dynamic allocation |
| Intrusive (must inherit from the base class) | Non-intrusive (third-party classes can participate) |
| Reference semantics | Value semantics |
| Algorithm scattered into classes | Algorithm in one place |
| Language supported | Library supported |
| Creates a first-class abstraction | It’s just a container |
| Keeps fluent interfaces | Disables fluent interfaces |
| Adding a new operation (generally) boils down to implementing a polymorphic method in all the classes | Adding a new operation simply requires writing a new free function |

<!-- .element: style="font-size: 0.5em" -->

Source: [Inheritance vs std::variant](http://cpptruths.blogspot.com/2018/02/inheritance-vs-stdvariant-based.html), C++ TRUTHS

<!-- .element: class="footnote" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 3

How many values?

```cpp
///options+=-std=c++17 -fpermissive
///hide
#include <optional>

///unhide
std::optional<char>;
```

`$$ 256 + 1 = 257 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 3

How many values?

```cpp
///options+=-std=c++17 -fpermissive
///hide
#include <variant>

///unhide
std::variant<char, bool>;
```

`$$ 256 + 2 = 258 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 3

How many values?

```cpp
///options+=-std=c++17 -fpermissive
///hide
#include <variant>

///unhide
template <typename T, typename U>
struct Foo {
  std::variant<T, U> m_v;
};
```

`$$ |T| + |U| $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" -->

## sum types

- When two types are "alternated" into one compound type, we add the # of inhabitants of the components.
- This kind of compounding gives us a sum type.

---

<!-- .slide: id="any" data-background-image="14_vocabulary_types/any.gif" -->

## any

<!-- .element: class="chapter" -->

---

> design a generic event queue which supports enqueuing arbitrary events and holds a thread which dispatches enqueued events to subscribed handlers.

---

## generic event queue

```cpp [1-9|11-22]
///hide
#include <chrono>
#include <iostream>

///unhide
class EventQueue
{
public:
  template<typename Data>
  void enqueue(Data data);

  template<typename Data, typename Handler>
  void subscribe(Handler&& handler);
};

///hide
template<typename Data>
void EventQueue::enqueue(Data data) {}

template<typename Data, typename Handler>
void EventQueue::subscribe(Handler&& handler) {}

void use() {
using namespace std::literals;
///unhide
EventQueue eq;

eq.subscribe<int>([](int i){
  std::cout << "got int " << i << '\n';
});

eq.subscribe<std::string>([](const std::string& s){
  std::cout << "got string " << s << '\n';
});

eq.enqueue(42);
eq.enqueue("hi"s);
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## `std::any`

```cpp [1|4-6|8-14]
///options+=-std=c++17
///hide
#include <cassert>
#include <string>
///unhide
#include <any>

int main() {
  std::any a;

  assert(!a.has_value());

  a = std::string("hello");
  assert(a.has_value());
  assert(a.type() == typeid(std::string));

  a = 42;
  assert(a.has_value());
  assert(a.type() == typeid(int));
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## `std::any_cast`

```cpp [1-3|5-10|12-18|20-31]
///options+=-std=c++17
///hide
#include <string>
#include <iostream>
#include <any>
#include <utility>
 
int main()
{
///unhide
auto a = std::any{12};

std::cout << std::any_cast<int>(a) << '\n'; 

try {
  std::cout << std::any_cast<std::string>(a) << '\n';
}
catch(const std::bad_any_cast& e) {
  std::cout << e.what() << '\n';
}

if (int* i = std::any_cast<int>(&a)) {
  std::cout << "a is int: " << *i << '\n';
} else if (std::string* s = std::any_cast<std::string>(&a)) {
  std::cout << "a is std::string: " << *s << '\n';
} else {
  std::cout << "a is another type or unset\n";
}

a = std::string{"hello"};

auto& ra = std::any_cast<std::string&>(a);
ra[1] = 'o';

std::cout << "a: "
  << std::any_cast<const std::string&>(a) << '\n';

auto b = std::any_cast<std::string&&>(std::move(a));

std::cout << "a: " << *std::any_cast<std::string>(&a)
    << "b: " << b << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: `b` is a move-constructed std::string, `a` is left in valid but unspecified state

---

## in-place construction

```cpp
///options+=-std=c++17
///hide
#include <string>
#include <any>
#include <cassert>
#include <vector>
#include <complex>

int main() {
///unhide
std::any a{std::in_place_type<std::string>, 4, 'A'};
assert(std::any_cast<std::string>(a) == "AAAA");

a.emplace<std::vector<int>>({1, 2, 3, 4, 5});
assert(std::any_cast<std::vector<int>>(a).size() == 5);

a = std::make_any<std::complex<double>>(3, 4);
assert(std::abs(std::any_cast<std::complex<double>>(a)) == 5);
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: can construct non-movable types and saves constructing a temporary and moving it in for movable types

---

<!-- .slide: class="aside" -->

## `std::type_index` (C++11)

```cpp []
///options+=-std=c++17
///hide
#include <string>
#include <unordered_map>
#include <typeinfo>
#include <iostream>
///unhide
#include <typeindex>

struct A {};

///hide
int main() {
///unhide
std::unordered_map<std::type_index, std::string> type_names{
  {std::type_index(typeid(int)),    "int"},
  {std::type_index(typeid(double)), "double"},
  {std::type_index(typeid(A)),      "A"}
};

int i;
double d;
A a;

std::cout << "i is " << type_names[std::type_index(typeid(i))] << '\n';
std::cout << "d is " << type_names[std::type_index(typeid(d))] << '\n';
std::cout << "a is " << type_names[std::type_index(typeid(a))] << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: The `type_index` class is a wrapper class around a `std::type_info` object, that can be used as index in associative containers. 

---

## implementing event queue

```cpp [1,59|55-58|51-54|20-27|11-18|30-42|44-49|62-74]
///options+=-std=c++17 -pthread
///output=got int 42\ngot string hi
///hide
#include <any>
#include <chrono>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>
#include <typeindex>
#include <unordered_map>
#include <condition_variable>

///unhide
class EventQueue {
 public:
  ~EventQueue() {
    {
      std::lock_guard<std::mutex> lg{mutex_};
      stop = true;
    }
    runner_.join();
  }

  template <typename Data>
  void enqueue(Data&& data) {
    {
      std::lock_guard<std::mutex> lg{mutex_};
      queue_.emplace(std::type_index{typeid(Data)}, data);
    }
    cond_var_.notify_one();
  }

  template <typename Data, typename Handler>
  void subscribe(Handler&& handler) {
    std::lock_guard<std::mutex> lg{mutex_};
    subscribers_.emplace(std::type_index{typeid(Data)},
      [h = std::forward<Handler>(handler)](std::any a) {
        std::forward<decltype(h)>(h)(std::any_cast<Data>(a));
      });
  }

 private:
  void run() {
    do {
      std::unique_lock<std::mutex> ul{mutex_};
      cond_var_.wait(ul, [this] { 
        return stop || !queue_.empty(); 
      });
      while (!queue_.empty()) {
        auto& front = queue_.front();
        dispatch(front.first, front.second);
        queue_.pop();
      }
    } while (!stop);
  }

  void dispatch(std::type_index index, std::any value) {
    auto rng = subscribers_.equal_range(index);
    for (auto it = rng.first; it != rng.second; ++it) {
      it->second(value);
    }
  }

  std::thread runner_{[this] { run(); }};
  std::mutex mutex_;
  std::condition_variable cond_var_;
  bool stop = false;
  std::queue<std::pair<std::type_index, std::any>> queue_;
  std::unordered_multimap<std::type_index, 
                          std::function<void(const std::any&)>>
      subscribers_;
};

int main() { 
  using namespace std::literals;
  EventQueue eq;

  eq.subscribe<int>([](int i) { 
    std::cout << "got int " << i << '\n'; 
  });

  eq.subscribe<std::string>([](const std::string& s) { 
    std::cout << "got string " << s << '\n'; 
  });

  eq.enqueue(42);
  eq.enqueue("hi"s);
}
```

<!-- .element: style="font-size: 0.5em" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 4

How many values?

```cpp
bool f(bool);
```

`$$ 4 $$`

<!-- .element: class="fragment" data-fragment-index="0" -->

```cpp
bool f1(bool b) { return b; }
bool f2(bool)   { return true; }
bool f3(bool)   { return false; }
bool f4(bool b) { return !b; }
```

<!-- .element: class="fragment" data-fragment-index="0" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 4

How many values?

```cpp
enum class Foo
{
  BAR,
  BAZ,
  QUUX
};
char f(Foo);
```

`$$ 256 \cdot 256 \cdot 256 = 16,777,216 $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: class="aside" data-auto-animate -->

## LEVEL 4

How many values?

```cpp
template <class T, class U>
U f(T);
```

`$$ |U|^{|T|} $$`

<!-- .element: class="fragment" -->

---

## functions

- The number of values of a function is the number of different ways we can draw arrows between the inputs and the outputs.
- When we have a function from `A` to `B`, we raise the # of inhabitants of `B` to the power of the # of inhabitants of `A`.

---

## LEVEL 5

How many values?

```cpp
///options+=-std=c++17 -fpermissive
///hide
#include <any>
///unhide
std::any;
```

`$$ \infty $$`

<!-- .element: class="fragment" -->

---

<!-- .slide: data-background-image="14_vocabulary_types/cookie.gif" data-background-size="contain" -->