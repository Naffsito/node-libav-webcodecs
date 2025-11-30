const std = @import("std");
const napigen = @import("napigen");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const lib = b.addLibrary(.{
        .name = "libavjs",
        .linkage = .dynamic,
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });

    // Add napigen
    napigen.setup(lib);

    // Link against system ffmpeg libraries (installed via brew)
    // On macOS ARM: /opt/homebrew/opt/ffmpeg
    lib.root_module.addLibraryPath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/lib" });
    lib.root_module.addIncludePath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/include" });

    // Link the ffmpeg libraries
    lib.root_module.linkSystemLibrary("avcodec", .{});
    lib.root_module.linkSystemLibrary("avformat", .{});
    lib.root_module.linkSystemLibrary("avutil", .{});
    lib.root_module.linkSystemLibrary("avfilter", .{});
    lib.root_module.linkSystemLibrary("swscale", .{});
    lib.root_module.linkSystemLibrary("swresample", .{});
    lib.linkLibC();

    // Build the lib
    b.installArtifact(lib);

    // Copy the result to a *.node file so we can require() it
    const copy_node_step = b.addInstallLibFile(lib.getEmittedBin(), "libavjs.node");
    b.getInstallStep().dependOn(&copy_node_step.step);
}
