#include <algorithm>
#include <list>
#include <future>
#include <random>
#include <benchmark/benchmark.h>

template <typename T>
std::list<T> quick_sort(std::list<T> input)
{
  if (input.empty())
  {
    return input;
  }

  std::list<T> result;
  result.splice(result.begin(), input, input.begin());
  const auto &pivot = *result.begin();
  const auto divide_point = std::partition(input.begin(), input.end(),
                                           [&](T const &t) { return t < pivot; });
  std::list<T> lower_part;
  lower_part.splice(lower_part.end(), input, input.begin(),
                    divide_point);
  auto new_lower = quick_sort(std::move(lower_part));
  auto new_higher = quick_sort(std::move(input));
  result.splice(result.end(), new_higher);
  result.splice(result.begin(), new_lower);
  return result;
}

template <typename T>
std::list<T> parallel_quick_sort(std::list<T> input)
{
  if (input.empty())
  {
    return input;
  }

  std::list<T> result;
  result.splice(result.begin(), input, input.begin());
  const auto &pivot = *result.begin();
  const auto divide_point = std::partition(input.begin(), input.end(),
                                           [&](T const &t) { return t < pivot; });
  std::list<T> lower_part;
  lower_part.splice(lower_part.end(), input, input.begin(),
                    divide_point);
  auto new_lower = std::async(std::launch::async, &parallel_quick_sort<T>, std::move(lower_part));
  auto new_higher = parallel_quick_sort(std::move(input));
  result.splice(result.end(), new_higher);
  result.splice(result.begin(), new_lower.get());
  return result;
}

std::list<int64_t> generateData(size_t size)
{
  std::list<int64_t> res;

  std::mt19937 gen{std::random_device{}()};
  std::uniform_int_distribution<int64_t> dist;

  std::generate_n(std::back_inserter(res), size, [&] {
    return dist(gen);
  });

  return res;
}

static void SingleThreaded(benchmark::State &state)
{
  auto data = generateData(static_cast<size_t>(state.range(0)));
  // Code inside this loop is measured repeatedly
  for (auto _ : state)
  {
    auto sorted = quick_sort(data);
    assert(std::is_sorted(sorted.begin(), sorted.end()));
    // Make sure the variable is not optimized away by compiler
    benchmark::DoNotOptimize(data);
  }
}
// Register the function as a benchmark
BENCHMARK(SingleThreaded)->Ranges({{8 << 6, 8 << 10}});

static void Parallel(benchmark::State &state)
{
  auto data = generateData(static_cast<size_t>(state.range(0)));
  // Code inside this loop is measured repeatedly
  for (auto _ : state)
  {
    auto sorted = parallel_quick_sort(data);
    assert(std::is_sorted(sorted.begin(), sorted.end()));
    // Make sure the variable is not optimized away by compiler
    benchmark::DoNotOptimize(sorted);
  }
}
BENCHMARK(Parallel)->Ranges({{8 << 6, 8 << 10}});
