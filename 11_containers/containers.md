<!-- .slide: data-background-image="11_containers/giggs.jpg" data-background-size="contain" -->

---

<!-- .slide: id="type_aliases" class="aside" -->

## type aliases

|`typedef`|`using`|
|---------|-------|
|`typedef std::ios_base::fmtflags flags;`|`using flags = std::ios_base::fmtflags;`|
|`typedef void (*func)(int, int);`|`using func = void (*) (int, int);`|
| - |`template<class T>`<br/>`using ptr = T*;`|
|`template<class T>`<br/>`struct add_const {`<br/>&nbsp;&nbsp;`typedef const T type;`<br/>`};`|`template<class T>`<br/>`struct add_const {`<br/>&nbsp;&nbsp;`using type = const T;`<br/>`};`|
|`typedef int int_t, *intp_t;`|`using int_t = int;`<br/>`using intp_t = int*;`|

<!-- .element: class="no-header" style="font-size: 0.45em" -->

---

<!-- .slide: data-background-image="11_containers/containers.png" -->

# C++11 Containers

<!-- .element: class="chapter bottom" -->

---

### problems with c-style arrays
#### part 1 of N

cannot be passed by value

```cpp
void func(int* x); /* this is a pointer */

void func(int x[]); /* this is a pointer */

void func(int x[10]); /* this is a pointer */
```

---

### problems with c-style arrays
#### part 2 of N

hard to get number of elements

```cpp
///hide
#include <cstddef>

///unhide
int a[17];
size_t n = sizeof(a)/sizeof(a[0]);
```

---

[![array elements](11_containers/array_elements.png)](https://www.youtube.com/watch?v=7uAwFRQkzyA&ab_channel=NDCConferences)

---

### problems with c-style arrays
#### part 3 of N

what will happen when we combine the previous slides?

```cpp
///output=2
///hide
#include <iostream>

///unhide
void func(int a[17]) {
  std::cout << sizeof(a)/sizeof(a[0]) << '\n';
}
///hide
int main() {
  int a[17];
  func(a);
}
```

---

### problems with c-style arrays
#### part 4 of N

can't be assigned to

```cpp
///fails=error: 'str' does not name a type
extern char *getpass();
char str[10];
str = getpass("Enter password: ");
```

---

### problems with c-style arrays
#### part 5 of N

hard to overload on

```cpp
///output=pointer
///hide
#include <iostream>

///unhide
void func(int*) { std::cout << "pointer\n"; }

template <size_t N>
void func(int (&) [N]) {
  std::cout << "array\n";
}

int main() {
  int arr[2];
  func(arr);
}
```

---

<!-- .slide: id="array" data-background-image="11_containers/array.jpg" -->

# `std::array`

<!-- .element: class="chapter" -->

---

## `std::array`

```cpp
///hide
#include <cstddef>

///unhide
template<typename T, size_t N>
class array;
```

Note: unlike other standard containers, there's no allocator cause `array` never allocates

---

## basic usage

```cpp
///output=1 2 3
///hide
#include <iostream>
///unhide
#include <array>

int main() {
  std::array<int, 3> arr = {1, 2, 3};
  static_assert(sizeof(arr) == 3 * sizeof(int), 
                "no space overhead");
  for(const auto& a: arr)
        std::cout << a << ' ';
  std::cout << '\n';
}
```

Note: aggregate initialization, otherwise default initialization

---

## can be passed by value

reference, pointer, cv qualified...

```cpp
///hide
#include <array>

///unhide
void func(std::array<int, 10> x);
void func(const std::array<int, 10>& x);
void func(volatile std::array<int, 10>* x);
```

---

## convenient member functions

```cpp
///hide
#include <array>
#include <cassert>

int main() {
///unhide
std::array<double, 10> arr;
assert(arr.size() == 10);
arr.fill(42.0);
assert(arr.front() == arr.back());
///hide
}
```

---

## works with legacy code

```cpp
///hide
#include <array>

///unhide
void func(int* arr, int size);

///hide
void f() {
///unhide
std::array<int, 4> arr;
func(arr.data(), arr.size());
///hide
}
```

---

## checked and unchecked element access

```cpp
///hide
#include <stdexcept>

///unhide
template<typename Cont>
auto unchecked(const Cont& cont) {
  return cont[2];
}

template<typename Cont>
auto checked(const Cont& cont) {
  try {
    cont.at(2);
  } catch (std::out_of_range& ex){
    return -1;
  }
}
```

---

## multi-dimensional is a little verbose

instead of

```cpp
int board[3][3] = {{5, 8, 2}, {8, 3, 1}, {5, 3, 9}};
```

we have

```cpp
///hide
#include <array>

///unhide
std::array<std::array<int, 3>, 3> arr = 
  {{{5, 8, 2}, {8, 3, 1}, {5, 3, 9}}};
```

---

<!-- .slide: data-auto-animate class="aside" -->

## constructing pair

```cpp
///hide
#include <string>
#include <iostream>

///unhide
struct S {
  S(int a) {
    std::cout << "CTOR\n";
  }
  ~S() {
    std::cout << "DTOR\n";
  }
  S(S&&) {
    std::cout << "MOVE CTOR\n";
  }
};

///hide
int main() {
///unhide
std::pair<S, S> p{1, 3};
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate class="aside" -->

## constructing pair

```cpp
///fails=no matching function for call to 'std::pair<S, S>::pair(<brace-enclosed initializer list>)'
///hide
#include <string>
#include <iostream>

///unhide
struct S {
  S(int a, int b) {
    std::cout << "CTOR\n";
  }
  ~S() {
    std::cout << "DTOR\n";
  }
  S(S&&) {
    std::cout << "MOVE CTOR\n";
  }
};

///hide
int main() {
///unhide
std::pair<S, S> p{1, 2, 3, 4};
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate class="aside" -->

## constructing pair

```cpp
///hide
#include <string>
#include <iostream>

///unhide
struct S {
  S(int a, int b) {
    std::cout << "CTOR\n";
  }
  ~S() {
    std::cout << "DTOR\n";
  }
  S(S&&) {
    std::cout << "MOVE CTOR\n";
  }
};

///hide
int main() {
///unhide
std::pair<S, S> p{S{1, 2}, S{3, 4}};
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate class="aside" -->

## constructing pair

```cpp
///hide
#include <string>
#include <iostream>
#include <tuple>

///unhide
struct S {
  S(int a, int b) {
    std::cout << "CTOR\n";
  }
  ~S() {
    std::cout << "DTOR\n";
  }
  S(S&&) {
    std::cout << "MOVE CTOR\n";
  }
};

///hide
int main() {
///unhide
std::pair<S, S> p{std::piecewise_construct,
                  std::forward_as_tuple(1, 2), 
                  std::forward_as_tuple(3, 4)};
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.5em" -->

---

<!-- .slide: class="aside" -->

## hash table

![hash table](11_containers/hash.svg)

Note: Unordered associative containers—hash tables—are one of the most frequently requested additions to the standard C++ library. 

As you recall, in a hash table, each key is mapped to one of `N` buckets by means of a hash function. If more than one key is mapped to the same bucket, the values are chained in a list. 

When searching for keys, first the hash function is called to compute the bucket index which is then search linearly to find the matching key.
The (amortized) insertion and search times are O(1).

---

<!-- .slide: data-background-image="11_containers/unordered.jpg" -->

## unordered containers

<!-- .element: class="chapter bottom" -->

---

## `std::unordered_map`

```cpp
///hide
#include <functional>

///unhide
template<class Key,
         class T,
         class Hash = std::hash<Key>,
         class KeyEqual = std::equal_to<Key>,
         class Allocator = std::allocator<std::pair<const Key, T>>>
class unordered_map;
```

<!-- .element: style="font-size: 0.5em" -->

Note: the name isn't `hash_map` for 2 reasons:

1. `hash_map`s were already in use when this was standardized but might had small differences so defining a standard class with that name would introduce a nasty backward compatibility problem.
2. These names alert users to the most important way in which (say) `unordered_map` differs from `map`: the former lacks the latter's ordering guarantee.

---

<!-- .slide: data-auto-animate -->

## basic usage

```cpp [1|3-7|9-10]
///output=The HEX of color BLACK is:[]
///hide
#include <iostream>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

std::cout << "The HEX of color RED is:[" << u["RED"] << "]\n";
std::cout << "The HEX of color BLACK is:[" << u["BLACK"] << "]\n";
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

Note: There is no specialization for C strings. `std::hash<const char*>` produces a hash of the value of the pointer.

---

<!-- .slide: data-auto-animate -->

## insertion

```cpp [9-12]
///output=The HEX of color BLACK is:[#000000]
///hide
#include <iostream>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

u.emplace("BLACK", "#000000");

std::cout << "The HEX of color RED is:[" << u["RED"] << "]\n";
std::cout << "The HEX of color BLACK is:[" << u["BLACK"] << "]\n";
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

Note: to insert elements, it's best to call `emplace` which constructs the value in place.

---

<!-- .slide: data-auto-animate -->

## insertion

```cpp [9-15]
///output=The HEX of color BLACK is:[#000000]
///hide
#include <iostream>
#include <string>
#include <tuple>
#include <cstring>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

char black[] = "#000000";
u.emplace(std::piecewise_construct, 
          std::forward_as_tuple("BLACK"), 
          std::forward_as_tuple(black, strlen(black)));

std::cout << "The HEX of color RED is:[" << u["RED"] << "]\n";
std::cout << "The HEX of color BLACK is:[" << u["BLACK"] << "]\n";
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## checked

```cpp [9-14]
///external
///output=_Map_base::at
///compiler=clang600
///hide
#include <iostream>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

try {
  std::cout << "The HEX of color RED is:[" << u.at("RED") << "]\n";
  std::cout << "The HEX of color BLACK is:[" << u.at("BLACK") << "]\n";
} catch (std::out_of_range& ex){
  std::cerr << ex.what() << "\n";
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## find

```cpp [9-15]
///output=The HEX of color RED is:[#FF0000]
///hide
#include <iostream>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

for (const auto& key : {"RED", "BLACK"}) {
  auto it = u.find(key);
  if (it != u.end()) {
    std::cout << "The HEX of color " << key 
              << " is:[" << it->second << "]\n";
  }
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## iterating

```cpp [9-13]
///hide
#include <iostream>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

for (const auto& n : u) {
  std::cout << "Key:[" << n.first 
            << "] Value:[" << n.second 
            << "]\n";
}
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

<!-- .slide: data-auto-animate -->

## erasing

```cpp [9-17]
///hide
#include <cassert>
#include <string>
///unhide
#include <unordered_map>

///hide
int main() {
///unhide
std::unordered_map<std::string, std::string> u = {
  {"RED","#FF0000"},
  {"GREEN","#00FF00"},
  {"BLUE","#0000FF"}
};

for (auto it = u.begin(); it != u.end();) {
  if (it->second.substr(1, 2) == "00") {
    it = u.erase(it);
  } else {
    ++it;
  }
}

assert(u.size() == 1);
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

Note: unordered containers provide forward iterators.

---

## load factor

|a|b|
|-|-|
| `$$ loadFactor = \frac{occupied}{buckets} $$` | ![hash table](11_containers/hash.svg) <!-- .element: style="background-color: #bee4fd" --> |

<!-- .element: class="no-header no-border" -->

Note: in the example load factor is 5/255 ~ 0.02. 

A hash table is resized when its load factor goes beyond a predefined threshold. 

After resizing, the table is rehashed - all elements' hashes are recomputed and they're moved to their new location.

---

## managing load factor

```cpp [5-7|9|11-12]
///hide
#include <unordered_map>
#include <cassert>
#include <limits>

///unhide
bool approxEqual(float a, float b) {
  return abs(a - b) < std::numeric_limits<float>::epsilon();
}

///hide
int main() {
///unhide
std::unordered_map<int, double> um;
assert(um.load_factor() == 0.0);
assert(um.max_load_factor() == 1.0);

um.max_load_factor(0.7);

um.emplace(2, -2.5);
assert(approxEqual(um.load_factor(), 1.0 / um.bucket_count()));
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## be prepared

```cpp []
///hide
#include <unordered_map>
#include <cassert>

int main() {
///unhide
using map = std::unordered_map<int, double>;
map um{100};    // start with 100 buckets
// ...
um.rehash(50);  // prepare for 50/max_load_factor() elements
// ...
um.reserve(200); // prepare for 200 elements
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: before time critical sections, it's advised to prepare the hash table to the expected number of elements to be inserted so expensive rehashes won't occur when its least appropriate.

---

## `std::hash`

```cpp
///hide
#include <cstdint>

///unhide
template<class Key>
struct hash {
  std::size_t operator()(const Key&) const;
};
```

Note: as the number of buckets is less than `std::numeric_limits<size_t>::max()`, the container will need to map the return value to a bucket number, e.g. by taking the result modulo the number of buckets.

---

## standard provided hashing

- all integral types
- all floating-point types
- pointers
- strings
- some library types, like
  - `std::unique_ptr`
  - `std::bitset`

---

## writing hash functions

is difficult™

---

## writing hash functions

using boost

```cpp
///external
///libs=boost:173
///hide
#include <string>
#include <vector>
#include <unordered_set>
///unhide
#include <boost/container_hash/hash.hpp>

struct S {
  int a;
  double d;
  std::vector<std::string> v;
};

namespace std {
  template<> struct hash<S> {
    size_t operator()(const S& s) const {
        std::size_t seed = 0;
        boost::hash_combine(seed, s.a);
        boost::hash_combine(seed, s.d);
        boost::hash_range(seed, s.v.begin(), s.v.end());
        return seed;
    }
  };
}
///hide

std::unordered_set<S> us;
```

<!-- .element: style="font-size: 0.4em" -->

---

## accessing bucket structure

```cpp [1-2,10|3-4,8-9|5-7|12-16]
///output=bucket[1]: 8->7 1->2
///hide
#include <iostream>
#include <unordered_map>
#include <algorithm>

///unhide
template<typename Key, typename Val>
void printTable(const std::unordered_map<Key, Val>& um) {
  for(size_t i = 0; i < um.bucket_count(); ++i) {
    std::cout << "bucket[" << i << "]: ";
    for (auto it = um.begin(i); it != um.end(i); ++it) {
      std::cout << it->first << "->" << it->second << " ";
    }
    std::cout << '\n';
  }
}

int main() {
  std::unordered_map<int, int> um{
    {1, 2}, {5, 6}, {7, 8}, {9, 10}, {8, 7}
  };
  printTable(um);
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: Can be useful to debug your hash functions

---

## other unordered containers

- `<unordered_map>`
  - `std::unordered_multimap`
- `<unordered_set>`
  - `std::unordered_set`
  - `std::unordered_multiset`

---

## `std::list` overhead

```cpp
///external
///options+=-fsanitize=address
///fails=AddressSanitizer: 2424 byte(s) leaked in 101 allocation(s)
#include <list>

int main() {
  new std::list<int>(100);
}
```

---

<!-- .slide: id="""forward_list" data-background-image="11_containers/forward.jpg" -->

# `std::forward_list`

<!-- .element: class="chapter" -->

---

## `std::forward_list`

```cpp
///hide
#include <memory>

///unhide
template<class T,
         class Allocator = std::allocator<T>> 
class forward_list;
```

---

## less overhead

```cpp
///external
///options+=-fsanitize=address
///fails=AddressSanitizer: 1608 byte(s) leaked in 101 allocation(s)
#include <forward_list>

int main() {
  new std::forward_list<int>(100);
}
```

---

<!-- .slide: data-auto-animate -->

FILE: 11_containers/list.svg

---

<!-- .slide: data-auto-animate -->

FILE: 11_containers/list_with_it.svg

---

<!-- .slide: data-auto-animate -->

FILE: 11_containers/list_added.svg

---

<!-- .slide: data-auto-animate -->

FILE: 11_containers/list_begin.svg

---

## insertion

```cpp [17-19|20-25]
///hide
#include <forward_list>
#include <iostream>
#include <string>
 
///unhide
struct Sum {
  std::string remark;
  int sum;

  Sum(std::string remark, int sum)
    : remark{std::move(remark)}, sum{sum} {}

  void print() const {
    std::cout << remark << " = " << sum << '\n';
  }
};



int main()
{
  std::forward_list<Sum> list;

  auto iter = list.before_begin();
  std::string str{"1"};
  for (int i{1}, sum{1}; i != 10; sum += i) {
      iter = list.emplace_after(iter, str, sum);
      ++i;
      str += " + " + std::to_string(i);
  }

  for (const Sum& s : list) s.print();
}
```

<!-- .element: class="split" -->

---

## at front

```cpp
///hide
#include <forward_list>
#include <cassert>
int main ()
{
///unhide
std::forward_list<int> mylist{1, 2};
mylist.push_front(3);
mylist.emplace_front(4);
mylist.pop_front();
assert(mylist.front() == 3);
///hide
}
```

---

## algorithms

```cpp [9-17]
///hide
#include <iostream>
#include <forward_list>

///unhide
std::ostream& operator<<(std::ostream& ostr, 
                         const std::forward_list<int>& list) {
  for (auto &i : list) {
    ostr << " " << i;
  }
  return ostr;
}

///hide
int main() {
///unhide
std::forward_list<int> list1 = { 5,9,0,1,3 };
std::forward_list<int> list2 = { 8,7,2,6,4 };

list1.sort();
list2.sort();
std::cout << "list1:  " << list1 << "\n";
std::cout << "list2:  " << list2 << "\n";
list1.merge(list2);
std::cout << "merged: " << list1 << "\n";
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

---

<!-- .slide: data-background-image="11_containers/thanks.gif" -->

## thank you

<!-- .element: class="chapter" -->
