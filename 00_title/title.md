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
- In this series we're going to discuss the new language and library features added to the C++ standard in the new revisons released since.
- On each session we will have one main topic and smaller features will be introduced as needed.
- Let's start.

---

<div class="split">

## Chapters

1. [auto](#/1)
2. [Move Semantics](#/2)
3. [List Initialization](#/3)
4. [Variadic Templates](#/4)
5. [Lambda Expressions](#/5)

## Index

- [C++11](#/cpp11)
- [C++14](#/cpp14)
- [C++17](#/cpp17)
- [C++20](#/cpp20)

</div>

---

<!-- .slide: id="cpp11" -->

## C++11

<div class="split" column-count="4" id="bla">

### Language

- [x] [auto](#/auto) and [decltype](#/decltype)
- [x] [defaulted](#/defaulted) and [deleted](#/deleted) functions
- [x] [final](#/final) and [override](#/override)
- [x] [trailing return type](#/trailing_return)
- [x] [rvalue references](#/rvalue_references)
- [x] [move constructors](#/move_constructors) and [move assignment operators](#/move_constructors)
- [ ] scoped enums
- [ ] constexpr and literal types
- [x] [list initilization](#/list_initilization)
- [x] [delegating](#/delegating_constructors) and inherited constructors
- [ ] brace-or-equal initializers
- [x] [nullptr](#/nullptr)
- [ ] long long
- [ ] char16_t and char32_t
- [ ] type aliases
- [x] [variadic templates](#/variadic_templates)
- [ ] generalized (non-trivial) unions
- [ ] generalized PODs (trivial types and standard-layout types)
- [ ] Unicode string literals
- [ ] user-defined literals
- [ ] attributes
- [x] [lambda expressions](#/lambda_expressions)
- [x] [noexcept specifier](#/noexcept_specifier) and [noexcept operator](#/noexcept_operator)
- [ ] alignof and alignas
- [ ] multithreaded memory model
- [ ] thread-local storage
- [ ] GC interface
- [x] [range based for loop](#/range_for)
- [x] [static_assert](#/static_assert)

### Library

- [ ] atomic operations library
- [ ] emplace()
- [ ] std::unique_ptr
- [ ] std::move_iterator
- [x] [std::initializer_list](#/initializer_list)
- [ ] stateful and scoped allocators
- [ ] std::forward_list
- [ ] chrono library
- [ ] ratio library
- [ ] new algorithms
- [ ] Unicode conversion facets
- [ ] thread library
- [ ] std::exception_ptr
- [ ] std::error_code and std::error_condition
- [ ] iterator improvements
  - [x] [std::begin/end](#/begin_end)
  - [ ] std::next/prev
- [ ] Unicode conversion functions

</div>

---

<!-- .slide: id="cpp14" -->

## C++14

<div class="split" column-count="4">

### Language

- [ ] variable templates
- [x] [generic lambdas](#/generic_lambdas)
- [x] [lambda init-capture](#/lambda_init_capture)
- [ ] new/delete elision
- [ ] relaxed restrictions on constexpr functions
- [ ] binary literals
- [ ] digit separators
- [x] [return type deduction](#/auto_return) for functions
- [ ] aggregate classes with default non-static member initializers.

### Library

- [ ] std::make_unique
- [ ] std::shared_timed_mutex and std::shared_lock
- [ ] std::integer_sequence
- [ ] std::exchange
- [ ] std::quoted
- [ ] two-range overloads for some algorithms
- [ ] type alias versions of type traits
- [ ] user-defined literals for basic_string, duration and complex

</div>

---

<!-- .slide: id="cpp17" -->

## C++17

<div class="split" column-count="4">

### Language

- [ ] fold-expressions
- [ ] class template argument deduction
- [ ] non-type template parameters declared with auto
- [ ] compile-time if constexpr
- [ ] inline variables
- [ ] structured bindings
- [ ] initializers for if and switch
- [ ] u8 character literal
- [ ] simplified nested namespaces
- [ ] using-declaration declaring multiple names
- [ ] made noexcept part of type system
- [ ] new order of evaluation rules
- [ ] guaranteed copy elision
- [ ] lambda capture of *this
- [ ] constexpr lambda
- [ ] attribute namespaces don't have to repeat
- [ ] new attributes:
  - [ ] [[fallthrough]]
  - [ ] [[nodiscard]]
  - [ ] [[maybe_unused]]
- [ ] __has_include

</div>

---

## C++17

<div class="split" column-count="4">

### Library

- [ ] tuple:
  - [ ] apply
  - [ ] deduction_guides
  - [ ] make_from_tuple
- [ ] variant
- [ ] launder
- [ ] to_chars/from_chars
- [ ] as_const
- [ ] searchers
- [ ] optional
- [ ] any
- [ ] not_fn
- [ ] uninitialized memory
  - [ ] destroy_at
  - [ ] destroy
  - [ ] destroy_n
  - [ ] uninitialized_move
  - [ ] uninitialized_value_construct
- [ ] weak_from_this
- [ ] polymorphic allocators
- [ ] aligned_alloc
- [ ] transparent owner_less
- [ ] array support for shared_ptr
- [ ] allocation functions with explicit alignment
- [ ] byte
- [ ] [conjunction](#/conjunction)/disjunction/negation
- [ ] type trait variable templates (xxx_v)
- [ ] is_swappable
- [ ] is_invocable
- [ ] is_aggregate
- [ ] has_unique_object_representations.
- [ ] clamp
- [ ] execution policies
- [ ] reduce
- [ ] inclusive_scan
- [ ] exclusive_scan
- [ ] map/set extract and map/set merge
- [ ] map/unordered_map try_emplace and insert_or_assign
- [ ] contiguous iterators
- [ ] non-member size/empty/data
- [ ] mathematical special functions
- [ ] gcd
- [ ] lcm
- [ ] 3D hypot
- [ ] is_always_lock_free
- [ ] variadic lock_guard
- [ ] cache line interface
- [ ] uncaught_exceptions
- [ ] timespec_get
- [ ] rounding functions for duration and time_point

</div>

---

<!-- .slide: id="cpp20" -->

## C++20

<div class="split" column-count="4">

### Language

- [ ] Feature test macros
- [ ] 3-way comparison operator <=> and operator==() = default
- [ ] designated initializers
- [ ] init-statements and initializers in range-for
- [ ] char8_t
- [ ] new attributes
  - [ ] [[no_unique_address]]
  - [ ] [[likely]]
  - [ ] [[unlikely]]
- [ ] pack-expansions in lambda captures
- [ ] removed the requirement to use typename to disambiguate types in many contexts
- [ ] consteval, constinit
- [ ] further relaxed constexpr
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

<div class="split" column-count="4">

### Library

- [ ] Formatting library
- [ ] Calendar and Time Zone library
- [ ] std::source_location
- [ ] std::span
- [ ] std::endian
- [ ] array support for std::make_shared
- [ ] std::remove_cvref
- [ ] std::to_address
- [ ] floating point and shared_ptr atomics
- [ ] std::barrier, std::latch, and std::counting_semaphore
- [ ] std::jthread and thread cancellation classes
- [ ] <version>
- [ ] std::osyncstream
- [ ] std::u8string and other char8_t uses
- [ ] constexpr for <algorithm>, <utility>, <complex>
- [ ] std::string::starts_with / ends_with and std::string_view::starts_with / ends_with
- [ ] std::assume_aligned
- [ ] std::bind_front
- [ ] std::c8rtomb/std::mbrtoc8
- [ ] std::make_obj_using_allocator etc
- [ ] std::make_shared_for_overwrite / std::make_unique_for_overwrite
- [ ] heterogeneous lookup in unordered associative containers
- [ ] std::polymoprhic_allocator with additional member functions and std::byte as its default template argument
- [ ] std::execution::unseq
- [ ] std::midpoint and std::lerp
- [ ] std::ssize
- [ ] std::is_bounded_array, std::is_unbounded_array
- [ ] Ranges
- [ ] uniform container erasure (std::erase/std::erase_if)
- [ ] Mathematical constants

</div>