#include <benchmark/benchmark.h>

#include <frozen/unordered_set.h>
#include <frozen/string.h>

#include <unordered_set>
#include <array>
#include <string>
#include <algorithm>

namespace detail
{

  template <template<typename, size_t> typename Array, size_t Size, typename T, std::size_t... I>
  constexpr Array<T, Size> make_array(const T* iter, std::index_sequence<I...>)
  {
    return {((void)I, *iter++)...};
  }

} // namespace detail

template <template<typename, size_t> typename Array, size_t Size, typename T>
constexpr Array<T, Size> make_array(std::initializer_list<T> list)
{
  return detail::make_array<Array, Size>(list.begin(), std::make_index_sequence<Size>());
}

constexpr std::initializer_list<frozen::string> Keywords{
    "auto", "break", "case", "char", "const", "continue",
    "default", "do", "double", "else", "enum", "extern",
    "float", "for", "goto", "if", "int", "long",
    "register", "return", "short", "signed", "sizeof", "static",
    "struct", "switch", "typedef", "union", "unsigned", "void",
    "volatile", "while"};

static auto const *volatile Some = &Keywords;

template <size_t Size>
void FrozenUnorderedSetHit(benchmark::State &state)
{
  const frozen::unordered_set<frozen::string, Size> set{make_array<frozen::bits::carray, Size>(Keywords)};
  for (auto _ : state)
  {
    for (auto kw : *Some)
    {
      volatile bool status = set.count(kw);
      (void)status;
    }
  }
}
BENCHMARK_TEMPLATE(FrozenUnorderedSetHit, 4);
BENCHMARK_TEMPLATE(FrozenUnorderedSetHit, 8);
BENCHMARK_TEMPLATE(FrozenUnorderedSetHit, 16);
BENCHMARK_TEMPLATE(FrozenUnorderedSetHit, 32);

static void StdUnorderedSetHit(benchmark::State &state)
{
  const std::unordered_set<frozen::string> set(Keywords.begin(), Keywords.begin() + state.range(0));
  for (auto _ : state)
  {
    for (auto kw : *Some)
    {
      volatile bool status = set.count(kw);
      (void)status;
    }
  }
}

BENCHMARK(StdUnorderedSetHit)->RangeMultiplier(2)->Range(4, 32);

template<size_t Size>
static void StdArrayHit(benchmark::State &state)
{
  const auto array = make_array<std::array, Size>(Keywords);
  for (auto _ : state)
  {
    for (auto kw : *Some)
    {
      volatile bool status = std::find(array.begin(), array.end(), kw) != array.end();
      (void)status;
    }
  }
}

BENCHMARK_TEMPLATE(StdArrayHit, 4);
BENCHMARK_TEMPLATE(StdArrayHit, 8);
BENCHMARK_TEMPLATE(StdArrayHit, 16);
BENCHMARK_TEMPLATE(StdArrayHit, 32);

static const frozen::string SomeStrings[32] = {
    "auto0", "break0", "case0", "char0", "const0", "continue0",
    "default0", "do0", "double0", "else0", "enum0", "extern0",
    "float0", "for0", "goto0", "if0", "int0", "long0",
    "register0", "return0", "short0", "signed0", "sizeof0", "static0",
    "struct0", "switch0", "typedef0", "union0", "unsigned0", "void0",
    "volatile0", "while0"};
static auto const *volatile SomeStringsPtr = &SomeStrings;

template<size_t Size>
static void FrozenUnorderedSetMiss(benchmark::State &state)
{
  constexpr frozen::unordered_set<frozen::string, Size> set{make_array<frozen::bits::carray, Size>(Keywords)};
  for (auto _ : state)
  {
    for (auto kw : *SomeStringsPtr)
    {
      volatile bool status = set.count(kw);
      (void)status;
    }
  }
}
BENCHMARK_TEMPLATE(FrozenUnorderedSetMiss, 4);
BENCHMARK_TEMPLATE(FrozenUnorderedSetMiss, 8);
BENCHMARK_TEMPLATE(FrozenUnorderedSetMiss, 16);
BENCHMARK_TEMPLATE(FrozenUnorderedSetMiss, 32);

static void StdUnorderedSetMiss(benchmark::State &state)
{
  const std::unordered_set<frozen::string> set(Keywords.begin(), Keywords.begin() + state.range(0));
  for (auto _ : state)
  {
    for (auto kw : *SomeStringsPtr)
    {
      volatile bool status = set.count(kw);
      (void)status;
    }
  }
}
BENCHMARK(StdUnorderedSetMiss)->RangeMultiplier(2)->Range(4, 32);

template<size_t Size>
static void StdArrayMiss(benchmark::State &state)
{
  constexpr auto array = make_array<std::array, Size>(Keywords);
  for (auto _ : state)
  {
    for (auto kw : *SomeStringsPtr)
    {
      volatile bool status = std::find(array.begin(), array.end(), kw) != array.end();
      (void)status;
    }
  }
}

BENCHMARK_TEMPLATE(StdArrayMiss, 4);
BENCHMARK_TEMPLATE(StdArrayMiss, 8);
BENCHMARK_TEMPLATE(StdArrayMiss, 16);
BENCHMARK_TEMPLATE(StdArrayMiss, 32);
