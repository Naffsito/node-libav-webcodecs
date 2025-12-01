const std = @import("std");
const napigen = @import("napigen");
const builtin = @import("builtin");

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

    // Cross-platform FFmpeg library paths
    const target_info = target.result;
    switch (target_info.os.tag) {
        .macos => {
            if (target_info.cpu.arch == .aarch64) {
                // macOS ARM (Apple Silicon) - Homebrew
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/lib" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/include" });
            } else {
                // macOS Intel - Homebrew
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/local/opt/ffmpeg/lib" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/local/opt/ffmpeg/include" });
            }
        },
        .linux => {
            // Linux - standard system paths (apt/dnf installed ffmpeg-dev)
            // Try common paths for different distros
            lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib/x86_64-linux-gnu" }); // Debian/Ubuntu
            lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib64" }); // Fedora/RHEL
            lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib" }); // Generic
            lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/include" });
            lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/include/ffmpeg" }); // Some distros
        },
        .windows => {
            // Windows - common install locations
            // Users typically download FFmpeg and extract to C:\ffmpeg or similar
            lib.root_module.addLibraryPath(.{ .cwd_relative = "C:/ffmpeg/lib" });
            lib.root_module.addLibraryPath(.{ .cwd_relative = "C:/ffmpeg/bin" }); // DLLs often here
            lib.root_module.addIncludePath(.{ .cwd_relative = "C:/ffmpeg/include" });
        },
        else => {
            // Fallback - try standard Unix paths
            lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/local/lib" });
            lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/local/include" });
        },
    }

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
