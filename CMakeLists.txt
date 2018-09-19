cmake_minimum_required(VERSION 2.8)
set(CMAKE_VERBOSE_MAKEFILE OFF)

project(craft)

FILE(GLOB SOURCE_FILES src/*.c)
list(REMOVE_ITEM SOURCE_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/gen_main.c)

set(SRC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/src)
set(GEN_SOURCE_FILES
        ${SRC_DIR}/gen_main.c
        ${SRC_DIR}/world.c
        ${SRC_DIR}/map.c
        ${SRC_DIR}/sign.c)

function(JOIN VALUES GLUE OUTPUT)
    string (REPLACE ";" "${GLUE}" _TMP_STR "${VALUES}")
    set (${OUTPUT} "${_TMP_STR}" PARENT_SCOPE)
endfunction()

set(EXPORTED_FUNCTION_LIST
        init
        stop
        run_frame
        get_model_mem_location
        get_players_mem_location
        get_unused_player_mem_location
        get_workers_mem_location
        get_unused_chunk_mem_location
        find_chunk
        init_chunk
        delete_chunk
        gen_chunk
        on_left_click
        on_right_click
        on_middle_click)

SET(WORLD_INTERFACE_FUNCTION_LIST
        find_chunk
        get_unused_chunk_mem_location
        init_chunk
        delete_chunk
        gen_chunk)

JOIN("${EXPORTED_FUNCTION_LIST}" "', '_" EXPORTED_FUNCTIONS)
JOIN("${WORLD_INTERFACE_FUNCTION_LIST}" "', '_" WORLD_INTERFACE_FUNCTIONS)

add_executable(
    craft
    ${SOURCE_FILES}
    #deps/glew/src/glew.c
    deps/lodepng/lodepng.c
    deps/noise/noise.c
    deps/tinycthread/tinycthread.c)

add_executable(
    craft_gen
    ${GEN_SOURCE_FILES}
    deps/noise/noise.c)
# Generate HTML file wrapper in addition to .js
set(CMAKE_EXECUTABLE_SUFFIX ".html")

add_definitions(-std=c99 -O3)

# Emscripten default is GLFW 2.x but we use GLFW 3.x, also include data files
set_target_properties(craft PROPERTIES LINK_FLAGS "-s USE_GLFW=3 -s USE_PTHREADS=1 -s WASM=0 -s TOTAL_MEMORY=512MB --memoryprofiler -Os \
    -s EXPORTED_FUNCTIONS=\"['_${EXPORTED_FUNCTIONS}']\" -s EXTRA_EXPORTED_RUNTIME_METHODS=\"['cwrap', 'ccall', 'setValue', 'getValue']\" \
    --embed-file ../shaders/ --embed-file ../textures/ --shell-file ../index_shell.html")

set_target_properties(craft_gen PROPERTIES LINK_FLAGS "-s WASM=0 -s TOTAL_MEMORY=256MB \
    -s EXPORTED_FUNCTIONS=\"['_${WORLD_INTERFACE_FUNCTIONS}']\" -s EXTRA_EXPORTED_RUNTIME_METHODS=\"['cwrap', 'ccall', 'setValue', 'getValue']\"")

include_directories(deps/lodepng)
include_directories(deps/noise)
include_directories(deps/tinycthread)

set(CURL_LIBRARIES "")
