cmake_minimum_required(VERSION 3.15)

project(modern-cpp-benchmarks)

include(cmake/Conan.cmake)
run_conan()

find_package(Python REQUIRED)
find_package(benchmark REQUIRED)

file(
  GENERATE
  OUTPUT run_benchmark.cmake
  CONTENT
    "\
execute_process(
  COMMAND \${benchmark} --benchmark_format=csv
  COMMAND $<TARGET_FILE:Python::Interpreter> $<SHELL_PATH:${CMAKE_SOURCE_DIR}/plot/plot.py>
)
")

foreach(benchmark parallel_accumulate parallel_quicksort)
  add_executable(${benchmark} ${benchmark}.cpp)
  target_link_libraries(${benchmark} benchmark::benchmark)
  add_custom_target(
    run_${benchmark}
    COMMAND ${CMAKE_COMMAND} -D benchmark=$<TARGET_FILE:${benchmark}> -P
            run_benchmark.cmake)
endforeach()
