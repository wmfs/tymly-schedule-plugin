# [1.2.0](https://github.com/wmfs/tymly-schedule-plugin/compare/v1.1.0...v1.2.0) (2022-07-28)


### ✨ Features

* updates for scheduled sending [sc-14535] ([8703224](https://github.com/wmfs/tymly-schedule-plugin/commit/8703224e3c1cf8a0ba93be3027eafa64841cfc4f))


### 🐛 Bug Fixes

* update unit tests for datetime [sc-14535] ([155d3a5](https://github.com/wmfs/tymly-schedule-plugin/commit/155d3a544f6dcb9cf22c95713b5bd62a6a2d45c9))


### 🛠 Builds

* **deps-dev:** update dependency [@wmfs](https://github.com/wmfs)/tymly-pg-plugin to v1.268.1 ([0bd7069](https://github.com/wmfs/tymly-schedule-plugin/commit/0bd7069404eadf1d08e3824ed1ce9d1ff6816cfc))
* **deps-dev:** update dependency [@wmfs](https://github.com/wmfs)/tymly-test-helpers to v1.17.0 ([e9202a6](https://github.com/wmfs/tymly-schedule-plugin/commit/e9202a6cd86dc8429dfa1d077bccdef985231d85))


### ♻️ Chores

* enable tymly sync ([58ce844](https://github.com/wmfs/tymly-schedule-plugin/commit/58ce844d32d72c4be3c7cd19d230a99b6b53db6f))

# [1.1.0](https://github.com/wmfs/tymly-schedule-plugin/compare/v1.0.1...v1.1.0) (2022-03-16)


### ✨ Features

* ability to create/modify tasks from ui ([b7d56c5](https://github.com/wmfs/tymly-schedule-plugin/commit/b7d56c5e44609d4b2b14dbdc4e13a6c91f784eee))
* admin tools to create scheduled task ([b0e6ddc](https://github.com/wmfs/tymly-schedule-plugin/commit/b0e6ddc5325ace6332516275893471b39703c1ba))
* admin tools to start/stop tasks ([106f5fa](https://github.com/wmfs/tymly-schedule-plugin/commit/106f5fa7daedca13030b49fac473a891c5c6d9e1))
* admin tools to update schedule of state machine ([c6df466](https://github.com/wmfs/tymly-schedule-plugin/commit/c6df4669823e002916d4b86a0458e4e1d57ab45d))
* admin tools to update state machine config ([e26928a](https://github.com/wmfs/tymly-schedule-plugin/commit/e26928a276c1783fb92785eb2355570dd01f32ac))
* admin tools to view all and view specific tasks ([b9f80c8](https://github.com/wmfs/tymly-schedule-plugin/commit/b9f80c89077115ae2c783c0b03e8de322111319f))
* admin tools to view scheduled executions ([89b9094](https://github.com/wmfs/tymly-schedule-plugin/commit/89b90941de1b48a14896043ec3710df2c2440949))
* remove last ran start/end and total run count, as these can be found from executions ([d6c673b](https://github.com/wmfs/tymly-schedule-plugin/commit/d6c673b926654c564d08f6de1b5f22bcf61b3783))


### 🐛 Bug Fixes

* issue with finding scheduled executions ([b198bd1](https://github.com/wmfs/tymly-schedule-plugin/commit/b198bd1bf49ffb517229309eadaf7fdaed9f1ff7))
* use function from service to get executions ([b9082bc](https://github.com/wmfs/tymly-schedule-plugin/commit/b9082bc49ccdbd39c1316c786f83efddd7396a7d))


### 🚨 Tests

* fix status after re-boot with datetime schedule in past ([e4e9cba](https://github.com/wmfs/tymly-schedule-plugin/commit/e4e9cba84fbdaf91838e880b7dacda4659e60119))
* remove unused executions model ([92e888d](https://github.com/wmfs/tymly-schedule-plugin/commit/92e888d266803dac531a27f0c8d74ff6d6b22e52))

## [1.0.1](https://github.com/wmfs/tymly-schedule-plugin/compare/v1.0.0...v1.0.1) (2022-03-15)


### 🐛 Bug Fixes

* handle no blueprint components ([1d05697](https://github.com/wmfs/tymly-schedule-plugin/commit/1d05697563434dd01274121b5db59db3ec0e39ae))

# 1.0.0 (2022-03-15)


### ✨ Features

* ability to stop tasks ([1540f7a](https://github.com/wmfs/tymly-schedule-plugin/commit/1540f7ae85aac4ae9cdd87b3b12ee9ddadf6beb3))
* allow for timezone option ([6dc4082](https://github.com/wmfs/tymly-schedule-plugin/commit/6dc408296538b4f3815a5aad372b140ce5651529))
* allow rescheduling ([3b3f1f9](https://github.com/wmfs/tymly-schedule-plugin/commit/3b3f1f9e7e4b788a24ee45559e351a873d7c46dc))
* allow rescheduling, cron style or date style ([a55b75c](https://github.com/wmfs/tymly-schedule-plugin/commit/a55b75c5a639ad5aa49cbaea929fbc9ff82dea09))
* function to convert datetime back to rule ([b7b68e7](https://github.com/wmfs/tymly-schedule-plugin/commit/b7b68e7c4836001965243fef22773703553f574e))
* move rule/datetime converting into utils directory ([a425105](https://github.com/wmfs/tymly-schedule-plugin/commit/a42510596a87bb1fc617a18526bb9b1d14b92ab3))


### 🐛 Bug Fixes

* add log for execution error ([c49d261](https://github.com/wmfs/tymly-schedule-plugin/commit/c49d26104a72be787d361b1df2381ecbe5ca13f2))
* issues with scheduling for dates ([9c4b40f](https://github.com/wmfs/tymly-schedule-plugin/commit/9c4b40f9bf88ae7eaf8398a9634c065f935d91ae))
* persist schedule config from db ([5034eff](https://github.com/wmfs/tymly-schedule-plugin/commit/5034eff6dd953653b1094f132112992b25232413))
* rename some things ([b42cf44](https://github.com/wmfs/tymly-schedule-plugin/commit/b42cf447eb02e20435498c19c159fb64f787293e))


### 📦 Code Refactoring

* use node-schedule instead ([a8e57ff](https://github.com/wmfs/tymly-schedule-plugin/commit/a8e57ffe1a7d4728596eac187cfe7229f6a4d6a3))


### 🚨 Tests

* more tests ([87f9de1](https://github.com/wmfs/tymly-schedule-plugin/commit/87f9de1a1133d0ffe1421e699d260da3f677af85))


### ⚙️ Continuous Integrations

* add db config for circle ([4541e9d](https://github.com/wmfs/tymly-schedule-plugin/commit/4541e9d9df5794c55acc618ff8ce3fa5aa03a4ef))


### ♻️ Chores

* disable tymly sync ([d0776ba](https://github.com/wmfs/tymly-schedule-plugin/commit/d0776ba009ae234a5644b64911142ef8abc7bc54))
* initial commit, simple state machine scheduling ([26d7163](https://github.com/wmfs/tymly-schedule-plugin/commit/26d7163980df98100bf561237af339123c710e8d))
* rename to tymly schedule plugin ([2937228](https://github.com/wmfs/tymly-schedule-plugin/commit/29372288cfeefba537afdb6d65e4c11709ddfbb0))
