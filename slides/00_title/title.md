# C++11 and Beyond! <!-- .element: id="title" -->

<img id="logo" src="00_title/cpp_logo.png" alt="logo">

<table id="versions">
  <tr>
    <td><h1 id="v11">11</h1></td>
    <td><h1 id="v14">14</h1></td>
    <td><h1 id="v17">17</h1></td>
    <td><h1 id="v20">20</h1></td>
  </tr>
</table>

[Dvir Yitzchaki](https://github.com/dvirtz)

Note:
- The first C++ standard was published on 1998 with a small bug fix update on 2003.
- After being stale for over a decade, starting from 2011, the standard switched to a train model where a new standard is being released every 3 years.
- In this series we're going to discuss the new language and library features added to the C++ standard in the new revisions released since.
- On each session we will have one main topic and smaller features will be introduced as needed.
- Let's start.

---

## Chapters

1. [`auto`](#/1)
2. [Move Semantics](#/2)
3. [List Initialization](#/3)
4. [Variadic Templates](#/4)
5. [Lambda Expressions](#/5)
6. [Smart Pointers](#/6)
7. [`chrono`](#/7)
8. [Error Handling](#/8)
9. [Concurrency](#/9)
10. [Regular Expressions](#/10)
11. [Containers](#/11)
12. [Random](#/12)
13. [`constexpr`](#/13)
14. [C++17 Vocabulary Types](#/14)

<!-- .element: class="split" -->


---

## Index

<div class="split">

- [C++11](#/cpp11)
- [C++14](#/cpp14)
- [C++17](#/cpp17)
- [C++20](#/cpp20)

</div>

---

<!-- .slide: id="cpp11" -->

## C++11

<div class="split index">

### Language

- [x] [`auto`](#/auto) and [`decltype`](#/decltype)
- [x] [defaulted](#/defaulted) and [deleted](#/deleted) functions
- [x] [`final`](#/final) and [`override`](#/override)
- [x] [trailing return type](#/trailing_return)
- [x] [rvalue references](#/rvalue_references)
- [x] [move constructors](#/move_constructors) and [move assignment operators](#/move_constructors)
- [x] [scoped enums](#/scoped_enums)
- [x] [`constexpr`](#/constexpr) and [literal types](#/literal_type)
- [x] [list initialization](#/list_initialization)
- [x] [delegating](#/delegating_constructors) and inherited constructors
- [ ] brace-or-equal initializers
- [x] [`nullptr`](#/nullptr)
- [ ] `long long`
- [x] [`char16_t` and `char32_t`](#/utf_chars)
- [x] [type aliases](#type_aliases)
- [x] [variadic templates](#/variadic_templates)
- [ ] generalized (non-trivial) unions
- [ ] generalized PODs (trivial types and standard-layout types)
- [x] [Unicode string literals](#/utf_chars)
- [x] [user-defined literals](#/UDL)
- [x] [attributes](#/attributes)
- [x] [lambda expressions](#/lambda_expressions)
- [x] [`noexcept` specifier](#/noexcept_specifier) and [`noexcept` operator](#/noexcept_operator)
- [ ] `alignof` and `alignas`
- [x] multithreaded [memory model](#/atomic)
- [x] [thread-local](#/thread_local) storage
- [ ] GC interface
- [x] [range based for loop](#/range_for)
- [x] [`static_assert`](#/static_assert)

### Library

- [x] [atomic](#/atomic) operations library
- [x] [`emplace()`](#/emplace)
- [x] [`std::unique_ptr`](#/unique_ptr), [`std::shared_ptr`](#/shared_ptr), [`std::weak_ptr`](#/weak_ptr)
- [ ] `std::move_iterator`
- [x] [`std::initializer_list`](#/initializer_list)
- [ ] stateful and scoped allocators
- [x] [`std::forward_list`](#/forward_list)
- [x] [`chrono`](#/chrono) library
- [x] [`ratio`](#/ratio) library
- [ ] new algorithms
- [ ] Unicode conversion facets
- [x] [`thread`](#/concurrency) library
- [x] [`std::exception_ptr`](#/exception_ptr)
- [x] [`std::error_code`](#/error_code) and [`std::error_condition`](#/error_condition)
- [x] iterator improvements
  - [x] [`std::begin`/`end`](#/begin_end)
  - [x] [`std::next`/`prev`](#/next_prev)
- [ ] Unicode conversion functions
- [x] [`std::array`](#/array)
- [x] [`std::tuple`](#/tuple)

</div>

---

<!-- .slide: id="cpp14" -->

## C++14

<div class="split index">

### Language

- [x] variable templates(#/variable_templates)
- [x] [generic lambdas](#/generic_lambdas)
- [x] [lambda init-capture](#/lambda_init_capture)
- [ ] `new`/`delete` elision
- [x] [relaxed](#/relaxed_constexpr) restrictions on `constexpr` functions
- [x] [binary literals](#/binary_literals)
- [x] [digit separators](#/binary_literals)
- [x] [return type deduction](#/auto_return) for functions
- [ ] aggregate classes with default non-static member initializers.

### Library

- [x] [`std::make_unique`](#/make_unique)
- [x] `std::shared_timed_mutex` and [`std::shared_lock`](#/shared_lock)
- [ ] `std::integer_sequence`
- [ ] `std::exchange`
- [ ] `std::quoted`
- [ ] two-range overloads for some algorithms
- [ ] type alias versions of type traits
- [x] user-defined literals for [`basic_string`](#/string_literals), [`duration`](#/duration_literals) and [`complex`](#/complex_literals)

</div>

---

<!-- .slide: id="cpp17" -->

## C++17

<div class="split index">

### Language

- [ ] fold-expressions
- [ ] class template argument deduction
- [ ] non-type template parameters declared with auto
- [x] compile-time [`if constexpr`](#/constexpr_if)
- [ ] inline variables
- [ ] structured bindings
- [ ] initializers for if and switch
- [ ] u8 character literal
- [ ] simplified nested namespaces
- [ ] using-declaration declaring multiple names
- [ ] made `noexcept` part of type system
- [ ] new order of evaluation rules
- [ ] guaranteed copy elision
- [ ] lambda capture of `*this`
- [x] [`constexpr` lambda](#/constexpr_lambda)
- [ ] attribute namespaces don't have to repeat
- [ ] new attributes:
  - [ ] `[[fallthrough]]`
  - [ ] `[[nodiscard]]`
  - [ ] `[[maybe_unused]]`
- [ ] __has_include

</div>

---

## C++17

<div class="split index">

### Library

- [ ] `tuple`:
  - [ ] `apply`
  - [ ] deduction guides
  - [ ] `make_from_tuple`
- [x] [`variant`](#/variant)
- [ ] `launder`
- [ ] `to_chars`/`from_chars`
- [ ] `as_const`
- [ ] searchers
- [x] [`optional`](#/optional)
- [x] [`any`](#/any)
- [ ] `not_fn`
- [ ] uninitialized memory
  - [ ] `destroy_at`
  - [ ] `destroy`
  - [ ] `destroy_n`
  - [ ] `uninitialized_move`
  - [ ] `uninitialized_value_construct`
- [ ] `weak_from_this`
- [ ] polymorphic allocators
- [ ] `aligned_alloc`
- [ ] transparent `owner_less`
- [ ] array support for `shared_ptr`
- [ ] allocation functions with explicit alignment
- [ ] `byte`
- [ ] [`conjunction`](#/conjunction)/`disjunction`/`negation`
- [x] type trait [variable templates](#/variable_templates) (xxx_v)
- [ ] `is_swappable`
- [ ] `is_invocable`
- [ ] `is_aggregate`
- [ ] `has_unique_object_representations`
- [ ] `clamp`
- [ ] execution policies
- [ ] `reduce`
- [ ] `inclusive_scan`
- [ ] `exclusive_scan`
- [ ] `map`/`set` extract and merge
- [ ] `map`/`unordered_map` `try_emplace` and `insert_or_assign`
- [ ] contiguous iterators
- [ ] non-member `size`/`empty`/`data`
- [ ] mathematical special functions
- [ ] `gcd`
- [ ] `lcm`
- [ ] 3D `hypot`
- [x] [`is_always_lock_free`](#/is_always_lock_free)
- [x] variadic [`lock_guard`](#/scoped_lock)
- [ ] cache line interface
- [ ] `uncaught_exceptions`
- [ ] `timespec_get`
- [x] [rounding functions](#/chrono_rounding) for `duration` and `time_point`

</div>

---

<!-- .slide: id="cpp20" -->

## C++20

<div class="split index">

### Language

- [ ] Feature test macros
- [ ] 3-way comparison `operator<=>` and `operator==() = default`
- [ ] designated initializers
- [ ] init-statements and initializers in range-for
- [x] [char8_t](#/utf_chars)
- [ ] new attributes
  - [ ] `[[no_unique_address]]`
  - [ ] `[[likely]]`
  - [ ] `[[unlikely]]`
- [ ] pack-expansions in lambda captures
- [ ] removed the requirement to use `typename` to disambiguate types in many contexts
- [x] [`consteval`](#/consteval), [`constinit`](#/constinit)
- [x] further relaxed [`constexpr`](#/20_constexpr)
- [ ] signed integers are 2's complement
- [ ] aggregate initialization using parentheses
- [ ] Coroutines
- [ ] Modules
- [ ] Constraints and concepts
- [ ] Abbreviated function templates
- [ ] DR: array new can deduce array size

</div>

---

## C++20

<div class="split index">

### Library

- [ ] Formatting library
- [ ] Calendar and Time Zone library
- [ ] `std::source_location`
- [ ] `std::span`
- [ ] `std::endian`
- [ ] array support for `std::make_shared`
- [ ] `std::remove_cvref`
- [ ] `std::to_address`
- [ ] floating point and `shared_ptr` atomics
- [ ] `std::barrier`, `std::latch`, and `std::counting_semaphore`
- [ ] `std::jthread` and thread cancellation classes
- [ ] `<version>`
- [ ] `std::osyncstream`
- [ ] `std::u8string` and other `char8_t` uses
- [x] [`constexpr` for `<algorithm>`, `<utility>`, `<complex>`](#/20_constexpr_lib/0)
- [ ] `std::string::starts_with` / `ends_with` and `std::string_view::starts_with` / `ends_with`
- [ ] `std::assume_aligned`
- [ ] `std::bind_front`
- [ ] `std::c8rtomb`/`std::mbrtoc8`
- [ ] `std::make_obj_using_allocator` etc
- [ ] `std::make_shared_for_overwrite` / `std::make_unique_for_overwrite`
- [ ] heterogeneous lookup in unordered associative containers
- [ ] `std::polymoprhic_allocator` with additional member functions and `std::byte` as its default template argument
- [ ] `std::execution::unseq`
- [ ] `std::midpoint` and `std::lerp`
- [ ] `std::ssize`
- [ ] `std::is_bounded_array`, `std::is_unbounded_array`
- [ ] Ranges
- [ ] uniform container erasure (`std::erase`/`std::erase_if`)
- [ ] Mathematical constants

</div>