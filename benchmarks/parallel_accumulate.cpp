#include <benchmark/benchmark.h>
#include <thread>
#include <algorithm>
#include <vector>
#include <iostream>
#include <future>
#include <numeric>

class thread_joiner
{
public:
  explicit thread_joiner(std::thread thread)
      : m_thread{std::move(thread)}
  {
  }
  ~thread_joiner()
  {
    if (m_thread.joinable())
    {
      m_thread.join();
    }
  }
  thread_joiner(const thread_joiner &) = delete;
  thread_joiner(thread_joiner &&) = default;
  thread_joiner &operator=(const thread_joiner &) = delete;
  thread_joiner &operator=(thread_joiner &&) = default;

private:
  std::thread m_thread;
};

template <typename Iterator, typename T, ptrdiff_t MIN_PER_THREAD = 25>
T parallel_accumulate(Iterator first, Iterator last, T init)
{
  const auto length = std::distance(first, last);
  if (!length)
    return init;

  const auto max_threads = (length + MIN_PER_THREAD - 1) / MIN_PER_THREAD;
  const auto hardware_threads = std::thread::hardware_concurrency();
  const auto num_threads =
      std::min<ptrdiff_t>(hardware_threads != 0 ? hardware_threads : 2,
                          max_threads);

  const auto block_size = length / num_threads;
  std::vector<T> results(static_cast<size_t>(num_threads));
  const auto accumulator = [](Iterator first, Iterator last, T &result) {
    result = std::accumulate(first, last, 0);
  };

  {
    std::vector<thread_joiner> threads;
    auto block_start = first;
    std::transform(results.begin(), std::prev(results.end()),
                   std::back_inserter(threads),
                   [&](int &result) {
                     const auto block_end = std::next(block_start, block_size);
                     std::thread t{accumulator, block_start, block_end, std::ref(result)};
                     block_start = block_end;
                     return thread_joiner{std::move(t)};
                   });

    accumulator(block_start, last, results.back());
  }

  return std::accumulate(results.begin(), results.end(), init);
}

template <typename Iterator, typename T, ptrdiff_t MIN_PER_THREAD = 25>
T async_accumulate(Iterator first, Iterator last, T init)
{
  const auto length = std::distance(first, last);
  if (!length)
    return init;

  const auto max_threads = (length + MIN_PER_THREAD - 1) / MIN_PER_THREAD;
  const auto hardware_threads = std::thread::hardware_concurrency();
  const auto num_threads =
      std::min<ptrdiff_t>(hardware_threads != 0 ? hardware_threads : 2,
                          max_threads);

  const auto block_size = length / num_threads;
  std::vector<std::future<T>> results;
  results.reserve(num_threads);
  const auto accumulator = [](Iterator first, Iterator last) {
    return std::accumulate(first, last, 0);
  };
  auto block_start = first;
  for (auto block_end = std::next(block_start, block_size); 
       std::distance(block_start, last) >= block_size; 
       block_start = block_end, block_end = std::next(block_start, block_size))
  {
    results.push_back(std::async(accumulator, block_start, block_end));
  };

  std::promise<T> pr;
  results.push_back(pr.get_future());
  pr.set_value(accumulator(block_start, last));

  return std::accumulate(results.begin(), results.end(), init, [](int current, std::future<T> &rhs) {
    return current + rhs.get();
  });
}

std::vector<int64_t> generateData(size_t size)
{
  std::vector<int64_t> res;
  res.reserve(size);
  std::generate_n(std::back_inserter(res), size, [i = 0]() mutable {
    return i++;
  });

  return res;
}

static void SingleThreaded(benchmark::State &state)
{
  auto data = generateData(static_cast<size_t>(state.range(0)));
  // Code inside this loop is measured repeatedly
  for (auto _ : state)
  {
    auto total = std::accumulate(data.begin(), data.end(), 0);
    // Make sure the variable is not optimized away by compiler
    benchmark::DoNotOptimize(total);
  }
}
// Register the function as a benchmark
BENCHMARK(SingleThreaded)->Ranges({{8 << 6, 8 << 20}});

static void Parallel(benchmark::State &state)
{
  auto data = generateData(static_cast<size_t>(state.range(0)));
  // Code inside this loop is measured repeatedly
  for (auto _ : state)
  {
    auto total = parallel_accumulate(data.begin(), data.end(), 0);
    assert(total == std::accumulate(data.begin(), data.end(), 0));
    // Make sure the variable is not optimized away by compiler
    benchmark::DoNotOptimize(total);
  }
}
BENCHMARK(Parallel)->Ranges({{8 << 6, 8 << 20}});

static void Async(benchmark::State &state)
{
  auto data = generateData(static_cast<size_t>(state.range(0)));
  // Code inside this loop is measured repeatedly
  for (auto _ : state)
  {
    auto total = async_accumulate(data.begin(), data.end(), 0);
    assert(total == std::accumulate(data.begin(), data.end(), 0));
    // Make sure the variable is not optimized away by compiler
    benchmark::DoNotOptimize(total);
  }
}
BENCHMARK(Async)->Ranges({{8 << 6, 8 << 20}});
