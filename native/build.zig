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

    // Check for ffmpeg-prefix build option first, then FFMPEG_PREFIX env var
    const ffmpeg_prefix_opt = b.option([]const u8, "ffmpeg-prefix", "FFmpeg installation prefix (e.g., /opt/homebrew/opt/ffmpeg)");
    const ffmpeg_prefix = ffmpeg_prefix_opt orelse (std.process.getEnvVarOwned(b.allocator, "FFMPEG_PREFIX") catch null);

    if (ffmpeg_prefix) |prefix| {
        // Use the provided prefix
        std.debug.print("Using FFmpeg prefix: {s}\n", .{prefix});
        const lib_path = std.fmt.allocPrint(b.allocator, "{s}/lib", .{prefix}) catch @panic("OOM");
        const include_path = std.fmt.allocPrint(b.allocator, "{s}/include", .{prefix}) catch @panic("OOM");

        lib.root_module.addLibraryPath(.{ .cwd_relative = lib_path });
        lib.root_module.addIncludePath(.{ .cwd_relative = include_path });
        lib.root_module.addRPath(.{ .cwd_relative = lib_path });
    } else {
        std.debug.print("No FFmpeg prefix provided, using platform defaults\n", .{});
        // Cross-platform FFmpeg library paths (fallback)
        const target_info = target.result;
        switch (target_info.os.tag) {
            .macos => {
                // macOS - try both Homebrew locations (ARM and Intel)
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/lib" }); // ARM
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/opt/homebrew/lib" }); // ARM alternate
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/local/opt/ffmpeg/lib" }); // Intel
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/local/lib" }); // Intel alternate
                lib.root_module.addIncludePath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/include" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/opt/homebrew/include" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/local/opt/ffmpeg/include" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/local/include" });
                // Add rpath for dynamic linking at runtime
                lib.root_module.addRPath(.{ .cwd_relative = "/opt/homebrew/opt/ffmpeg/lib" });
                lib.root_module.addRPath(.{ .cwd_relative = "/usr/local/opt/ffmpeg/lib" });
            },
            .linux => {
                // Linux - standard system paths (apt/dnf installed ffmpeg-dev)
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib/x86_64-linux-gnu" }); // Debian/Ubuntu x64
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib/aarch64-linux-gnu" }); // Debian/Ubuntu ARM64
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib64" }); // Fedora/RHEL
                lib.root_module.addLibraryPath(.{ .cwd_relative = "/usr/lib" }); // Generic
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/include" });
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/include/ffmpeg" }); // Some distros
                lib.root_module.addIncludePath(.{ .cwd_relative = "/usr/include/x86_64-linux-gnu" }); // Debian multiarch
            },
            .windows => {
                // Windows - common install locations
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
