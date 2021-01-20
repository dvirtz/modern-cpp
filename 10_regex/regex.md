<!-- .slide: data-background-image="10_regex/rooney.jpg" -->

---

<!-- .slide: data-background-image="10_regex/computer.gif" -->

## Regular Expressions library

<!-- .element: class="chapter bottom" -->

<div class="footnote">

Source: [The C++ Standard Library - A Tutorial and Reference, Nicolai Josuttis](http://www.cppstdlib.com/)

</div>

Note: Regular expressions were invented in the 1950s and made popular by the different UNIX test-processing utilities, like grep, lex, and sed. They are supported by many programming languages and from also arrived as part of C++11.

---

<!-- .slide: data-auto-animate -->

## matching xml tags

```cpp
///hide
#include <cassert>
///unhide
#include <regex>

///hide
int main() {
///unhide
std::regex reg{"<.*>.*</.*>"};
auto found1 = regex_match("<tag>value</tag>",
                          reg);
assert(found1);
auto found2 = regex_match("<tag>value<tag>",
                          reg);
assert(not found2);
auto found3 = regex_match("<tag>value</taq>",
                          reg);
assert(found3);
///hide
}
```

<!-- .element: data-id="code" -->

Note: we'll start with a classic example - XML parsing.

---

<!-- .slide: data-auto-animate -->

## same tag

```cpp
///hide
#include <cassert>
///unhide
#include <regex>

///hide
int main() {
///unhide
std::regex reg{"<(.*)>.*</\\1>"};
auto found1 = regex_match("<tag>value</tag>",
                          reg);
assert(found1);
auto found2 = regex_match("<tag>value</taq>",
                          reg);
assert(not found2);
///hide
}
```

<!-- .element: data-id="code" -->

Note: notice the double backslash that is caused by the fact that there are
two escaping steps here - one for the string and one for the regex.
It can be much worse though...

---

## backslash hell

```cpp
///hide
#include <regex>

///unhide
bool isStringLiteral(const std::string& input){
  std::regex reg{"('(?:[^\\\\']|\\\\.)*'|\"(?:[^\\\\\"]|\\\\.)*\")"};
  return std::regex_match(input, reg);
}
```
<!-- .element: style="font-size: 0.45em" -->

Note: this is a function for matching string literals of a language which allows both single and double quotes. Notice the group of 5 backslashes in a row.
To solve this C++11 added ...

---

<!-- .slide: data-auto-animate class="aside" -->

## raw string literals

instead of

```cpp
const char concert_17_raw[] =
    "id: 17\n"
    "artist: \"Beyonce\"\n"
    "date: \"Wed Oct 10 12:39:54 EDT 2012\"\n"
    "price_usd: 200\n";
```

<!-- .element: data-id="code" -->

Note: this is a multiline string, enabled by automatic concatenation of adjacent string literals.
quotes need to be escaped and newlines to be explicitly written.

---

<!-- .slide: data-auto-animate class="aside" -->

## raw string literals

write

```cpp
const char concert_17_raw[] = R"(
id: 17
artist: "Beyonce"
date: "Wed Oct 10 12:39:54 EDT 2012"
price_usd: 200
)";
```

<!-- .element: data-id="code" -->

Note: we define a raw string literal by wrapping it in `R"()"`. every whitespace inside matters so we need to align it all the way left to have each line starting without spaces. since quotes alone don't terminate the string they don't need to be quoted.
The type is still `const char[]`.

---

<!-- .slide: class="aside" -->

## custom delimiter

```cpp
///hide
#include <iostream>

int main() {
///unhide
std::cout << R"__(This contains quoted parens "()")__";
///hide
}
```

Note: if we need quoted parentheses inside the string we can have add a custom delimiter between the quotes and parentheses. 
custom delimiter is at most 16 characters except parentheses, backslash and spaces.

---

## hell cools down

```cpp
///hide
#include <regex>

///unhide
bool isStringLiteral(const std::string& input){
  std::regex reg{R"(('(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*"))"};
  return std::regex_match(input, reg);
}
```

Note: using raw string literals make the above example much more readable.

---

## back to xml


```cpp [3]
///hide
#include <cassert>
///unhide
#include <regex>

///hide
int main() {
///unhide
std::regex reg{R"(<(.*)>.*</\1>)"};
auto found1 = regex_match("<tag>value</tag>",
                          reg);
assert(found1);
auto found2 = regex_match("<tag>value</tap>",
                          reg);
assert(not found2);
///hide
}
```

Note: similarly on the xml example.

---

<!-- .slide: data-background-image="10_regex/words.gif" data-background-size="contain" -->

## syntax

<!-- .element: class="chapter" -->

Note: There are several slightly different regular expression syntaxes: PCRE (Perl Compatible Regular Expressions), ECMAScript and several from POSIX. The syntax used, by default, by the C++ standard is a modified ECMAScript standard.
The reason is that it's standardized (unlike PCRE) and enables more features than POSIX.

---

## single character

|expression|meaning|
|----------|-------|
|`.`|any character except newline|
|`[...]`|one of `...`|
|`[^...]`|none of `...`|
|`\n`, `\t`, `\f`, `\r`, `\v`|newline, tab, form feed, carriage return, vertical tab|
|`\xhh`, `\uhhh`|hexadecimal or Unicode|
|`[[:charclass:]]`|one of the characters of class `charclass`|
|`\d`, `\s`, `\w`|character class shortcuts|
|`\D`, `\S`, `\W`|character class negators|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## character classes

|class|shortcut|meaning|
|-----|--------|-------|
|`alpha`| |letter|
|`lower`| |lowercase letter|
|`upper`| |uppercase letter|
|`digit`|`\d`|digit|
|`xdigit`| |hexadecimal digit|
|`alnum`| |letter or digit|
|`blank`| |space or tab|
|`space`|`\s`|space|
|`punct`| |punctuation|
|`graph`| |printable character|
|`cntrl`| |control character|
| |`\w`|letter, digit or underscore|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## quantifiers

|expression|minimum|maximum|
|----------|-------|-------|
|`*`|0|∞|
|`+`|1|∞|
|`?`|0|1|
|`{decimal}`|decimal|decimal|
|`{decimal,}`|decimal|∞|
|`{decimal0,decimal1}`|decimal0|decimal1|

<!-- .element: class="no-border" style="font-size: 0.5em" -->

---

## detect C++ identifiers

```cpp
///hide
#include <regex>

///unhide
bool isCppIdentifier(const std::string& input) {
  return std::regex_match(input, 
                          std::regex{"[_[:alpha:]]\\w*"});
}
```

---

## alternatives

|expression|meaning|
|----------|-------|
|`X\|Y`|either `X` or `Y`|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## grouping

|expression|meaning|
|----------|-------|
|`(...)`|a capture group|
|`(?...)`|a non-capturing group|
|`\1`, `\2`, ...|back reference to group|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## assertions

|expression|meaning|
|----------|-------|
|`^`|beginning of line|
|`$`|end of line|
|`\b`|word boundary|
|`\B`|not a word boundary|
|`(?=...)`|positive lookahead|
|`(?!...)`|negative lookahead|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## look ahead

match 4 letters at end of line
which consist of 1 or 2 letters
followed by 2 or 3 digits

```cpp
///hide
#include <regex>

///unhide
bool check(const std::string& input) {
  std::regex r{"(?=[a-z0-9]{4}$)[a-z]{1,2}[0-9]{2,3}"};
  return std::regex_search(input, r);
}
```

Note: if we didn't use lookahead the character would be
consumed by the left group and we wouldn't be able to match
them by rest of the regex.

---

## using another syntax

```cpp [3-4]
///hide
#include <cassert>
///unhide
#include <regex>

///hide
int main() {
///unhide
std::regex reg{R"(<\(.*\)>.*</\1>)", 
               std::regex_constants::grep};
auto found1 = regex_match("<tag>value</tag>",
                          reg);
assert(found1);
auto found2 = regex_match("<tag>value</tap>",
                          reg);
assert(not found2);
///hide
}
```

Note: the standard supports the POSIX grammars as well.
In the `grep` syntax parentheses have no special meaning by default
and need to be escaped to form a capture group.

---

## available syntaxes

|flag|syntax|
|----|------|
|`std::regex_constants::ECMAScript`|Modified ECMAScript|
|`std::regex_constants::basic`|basic POSIX|
|`std::regex_constants::extended`|extended POSIX|
|`std::regex_constants::awk`|grammar used by the awk utility|
|`std::regex_constants::grep`|basic POSIX + '\n' as an alternation separator|
|`std::regex_constants::egrep`|extended POSIX + '\n' as an alternation separator|

<!-- .element: class="no-header no-border" style="font-size: 0.7em" -->

---

## basic vs. grep

```cpp
///hide
#include <cassert>
#include <regex>

int main() {
///unhide
std::string text = R"(multi
line
text)";
assert(std::regex_match(text, 
                        std::regex{"multi\nline\ntext", 
                                   std::regex_constants::basic}));
assert(not std::regex_match(text, 
                            std::regex{"multi\nline\ntext", 
                                       std::regex_constants::grep}));
assert(std::regex_match("text", 
                        std::regex{"multi\nline\ntext", 
                                   std::regex_constants::grep}));
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: in the `grep` syntax, `\n` acts like an alternative. 

---

## search input

```cpp
///hide
#include <regex>
#include <iostream>

int main() {
///unhide
std::string lines[] = {"Roses are #ff0000",
                       "violets are #0000ff",
                       "all of my bases belong to you"};

for (const auto &line : lines) {
  std::cout << line << ": " << std::boolalpha
            << std::regex_search(line, std::regex{"#[0-9a-f]{6}"}) 
            << '\n';
}
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: until now we matched the whole input. We can check if part of the input matches
the regex with `regex_search`.
This example finds lines containing RGB colors.

---

## get match

```cpp
///hide
#include <regex>
#include <iostream>

int main() {
///unhide
std::string lines[] = {"Roses are #ff0000",
                       "violets are #0000ff",
                       "all of my bases belong to you"};

for (const auto &line : lines) {
  std::smatch m;
  if (std::regex_search(line, m, std::regex{"#[0-9a-f]{6}"})) {
    std::cout << "matched " << m.str() << '\n';
  }
}
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

Note: usually it's not enough to know if a regex matched but we need to know where and what was matched
exactly. To this end we can pass a match object to either `regex_match` or `regex_search`.

---

## `std::match_results`

templated on searched text iterator

|type|definition|
|----|----------|
|`std::cmatch`|`std::match_results<const char*>`|
|`std::wcmatch`|`std::match_results<const wchar_t*>`|
|`std::smatch`|`std::match_results<std::string::const_iterator>`|
|`std::wsmatch`|`std::match_results<std::wstring::const_iterator>`|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## other members

```cpp [1-4|6-9|11-14]
///hide
#include <regex>
#include <iostream>

int main() {
///unhide
std::cmatch m;
std::regex_search("XML tag: <tag-name>the value</tag-name>.",
                  m,
                  std::regex{"<(.*)>(.*)</(\\1)>"});

std::cout << "found " << m.length() << " length match\n"
          << "starting from position " << m.position() << '\n'
          << "after " << m.prefix().str() << '\n'
          << "and before " << m.suffix().str() << "\n";

std::cout << "submatches are:\n";
for (const auto& submatch : m) {
  std::cout << submatch << '\n';
}
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

<!-- .slide: data-auto-animate -->

## three ways to obtain `submatch` `n`

```cpp
///hide
#include <regex>

///unhide
template<typename BidirIt>
typename std::match_results<BidirIt>::string_type 
submatch(std::match_results<BidirIt> m, size_t n) {
  return m.str(n);
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## three ways to obtain `submatch` `n`

```cpp
///hide
#include <regex>

///unhide
template<typename BidirIt>
typename std::match_results<BidirIt>::string_type 
submatch(std::match_results<BidirIt> m, size_t n) {
  return m[n].str();
}
```

<!-- .element: data-id="code" -->

---

<!-- .slide: data-auto-animate -->

## three ways to obtain `submatch` `n`

```cpp
///hide
#include <regex>

///unhide
template<typename BidirIt>
typename std::match_results<BidirIt>::string_type 
submatch(std::match_results<BidirIt> m, size_t n) {
  return *(m.begin() + n);
}
```

<!-- .element: data-id="code" -->

---

## other regex flags

|flag|effect|
|----|------|
|`std::regex_constants::icase`|match is case insensitive|
|`std::regex_constants::nosubs`|no matches are stored|
|`std::regex_constants::optimize`|optimize for matching speed rather than regex creation speed|
|`std::regex_constants::collate`|Character ranges of the form `[a-b]` will be locale sensitive|
|`std::regex_constants::multiline` (C++17)|`^` matches beginning of a line and `$` matches the end of a line|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## matching flags

|flag|effect|
|----|------|
|`std::regex_constants::match_not_bol`|`^` will not match before the first character|
|`std::regex_constants::match_not_eol`|`$` will not match after the last character|
|`std::regex_constants::match_not_bow`|`\b` will not match before the first character|
|`std::regex_constants::match_not_eow`|`\b` will not match after the last character|
|`std::regex_constants::match_any`|any match is acceptable|
|`std::regex_constants::match_not_null`|never match empty sequences|
|`std::regex_constants::match_continuous`|match should begin at first character|
|`std::regex_constants::match_prev_avail`|can refer to position before the first character|

<!-- .element: class="no-header no-border" style="font-size: 0.5em" -->

---

## `match_prev_avail`

```cpp
///hide
#include <cassert>
#include <regex>

int main() {
///unhide
assert(not std::regex_match("ba" + 1, std::regex{"\\Ba"}));
assert(std::regex_match("ba" + 1, std::regex{"\\Ba"},
                        std::regex_constants::match_prev_avail));
///hide
}
```

<!-- .element: style="font-size: 0.5em" -->

---

## lazy quantifiers

adding `?` to a quantifier makes it match as little as possible

```cpp [3,6]
///hide
#include <iostream>
#include <regex>

int main() {
///unhide
std::cmatch m;
std::cout << "greedy "
          << (std::regex_search("aaaa", m, std::regex{"a{2,3}"}), m.str()) 
          << '\n';
std::cout << "lazy "
          << (std::regex_search("aaaa", m, std::regex{"a{2,3}?"}), m.str())
          << '\n';
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

## iterating matches

```cpp [10-16]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
auto&& data = R"(
<person>
  <first>Stephen</first>
  <last>Kleene</last>
</person>
)";

std::regex r{"<(.*)>(.*)</(\\1)>"};

std::for_each(std::cregex_iterator{std::begin(data), std::end(data), r}, 
              std::cregex_iterator{},
              [](const std::cmatch& m) {
                std::cout << "match:  " << m.str() << '\n';
                std::cout << " tag:   " << m.str(1) << '\n';
                std::cout << " value: " << m.str(2) << '\n';
              });
///hide
}
```

<!-- .element: style="font-size: 0.43em" -->

---

## more refined iteration

```cpp [9-12]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
auto&& data = R"(
<person>
  <first>Stephen</first>
  <last>Kleene</last>
</person>
)";

std::regex r{"<(.*)>(.*)</(\\1)>"};
std::copy(
    std::cregex_token_iterator{std::begin(data), std::end(data), r, {2}},
    std::cregex_token_iterator{},
    std::ostream_iterator<std::csub_match>(std::cout, "\n"));
///hide
}
```

<!-- .element: style="font-size: 0.43em" -->

---

## iterate non-matches

```cpp [3,5]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
std::string names = "Anthony, Peter, George, David, William, Martin, Alfred";

std::regex r{R"(\s*,\s*)"};
std::copy(
    std::sregex_token_iterator{std::begin(names), std::end(names), r, {-1}},
    std::sregex_token_iterator{},
    std::ostream_iterator<std::ssub_match>(std::cout, ", "));
///hide
}
```

<!-- .element: style="font-size: 0.4em" -->

---

<!-- .slide: data-auto-animate -->

## replacing matches

```cpp [10-11]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
auto&& data = R"(
<person>
  <first>Stephen</first>
  <last>Kleene</last>
</person>
)";

std::regex r{"<(.*)>(.*)</(\\1)>"};

std::cout << std::regex_replace(data, r, R"(<$1 value="$2"/>)") 
          << '\n';
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->


---

<!-- .slide: data-auto-animate -->

## replacing matches

```cpp [10-12]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
auto&& data = R"(
<person>
  <first>Stephen</first>
  <last>Kleene</last>
</person>
)";

std::regex r{"<(.*)>(.*)</(\\1)>"};

std::cout << std::regex_replace(data, r, R"(<\1 value="\2"/>)",
                                std::regex_constants::format_sed) 
          << '\n';
///hide
}
```

<!-- .element: data-id="code" style="font-size: 0.45em" -->

---

## replacement syntax

| |Default|sed|
|-|-------|---|
|The matched pattern|$&|&|
|The `n`th matched capture group|$n|\n|
|The prefix of the matched pattern|$‘| |
|The suffix of the matched pattern|$’| |
|The $ character|$$|$|

---

## to output iterator

```cpp [10-15]
///hide
#include <regex>
#include <algorithm>
#include <iostream>

int main() {
///unhide
auto&& data = R"(
<person>
  <first>Stephen</first>
  <last>Kleene</last>
</person>
)";

std::regex r{"<(.*)>(.*)</(\\1)>"};

std::regex_replace(std::ostream_iterator<char>(std::cout),
                   std::begin(data), std::end(data), 
                   r,
                   R"(<$1 value="$2"/>)",
                   std::regex_constants::format_no_copy | 
                   std::regex_constants::format_first_only);
///hide
}
```

<!-- .element: style="font-size: 0.45em" -->

Note: the passed flags make `regex_replace` to only replace the first match and output matched part only.

---

## error handling

```cpp
///compiler=clang600
///hide
#include <regex>
#include <iostream>

int main() {
///unhide
try {
  std::regex pat{"\\\\.*index\\{([^}]*)\\}",
                 std::regex_constants::grep};
}
catch (const std::regex_error& e) {
  std::cerr << "regex_error: \n"
            << " what(): " << e.what() << '\n'
            << " code(): " << e.code() << '\n';
}
///hide
}
```

---

<!-- .slide: data-background-image="10_regex/thanks.gif" data-background-size="contain" -->

Note: There are a couple of design decisions I personally dislike about the regex library.
a. it's not inside a namespace so you have to repeat `regex_` every second line.
b. use of output params for match
c. having to specify different match type per string type
in addition it's known for not so great runtime but nevertheless, it's available everywhere
and gets the job done eventually.
