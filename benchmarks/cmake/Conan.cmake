macro(run_conan)
  # Download automatically, you can also just copy the conan.cmake file
  if(NOT EXISTS "${CMAKE_BINARY_DIR}/conan.cmake")
    message(STATUS "Downloading conan.cmake from https://github.com/conan-io/cmake-conan")
    file(DOWNLOAD "https://github.com/conan-io/cmake-conan/raw/v0.15/conan.cmake" "${CMAKE_BINARY_DIR}/conan.cmake")
  endif()

  include(${CMAKE_BINARY_DIR}/conan.cmake)

  set(CONAN_SYSTEM_INCLUDES ON)

  conan_cmake_run(
    REQUIRES
    ${CONAN_EXTRA_REQUIRES}
    benchmark/1.5.1
    frozen/1.0.0
    OPTIONS
    ${CONAN_EXTRA_OPTIONS}
    BASIC_SETUP
    GENERATORS
    cmake_paths cmake_find_package
    BUILD
    missing
    ENV
    CC=${CMAKE_C_COMPILER}
    CXX=${CMAKE_CXX_COMPILER})

    include(${CMAKE_BINARY_DIR}/conan_paths.cmake)
endmacro()
