using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEngine;

namespace InternetED.AIAgentConfig
{
    internal static class AIAgentConfigInstaller
    {
        [MenuItem("Tools/AI Agent Config/Install/User Scope")]
        private static void InstallUserScope()
        {
            var packageInfo = FindPackage(true);
            if (packageInfo != null)
            {
                RunSync(packageInfo, "install --scope user --prune", true);
            }
        }

        [MenuItem("Tools/AI Agent Config/Install/Project Scope")]
        private static void InstallProjectScope()
        {
            var packageInfo = FindPackage(true);
            if (packageInfo != null)
            {
                var projectRoot = Path.GetFullPath(Path.Combine(Application.dataPath, ".."));
                RunSync(packageInfo, $"install --scope project --project \"{projectRoot}\" --prune", true);
            }
        }

        [MenuItem("Tools/AI Agent Config/Validate Package")]
        private static void ValidatePackage()
        {
            var packageInfo = FindPackage(true);
            if (packageInfo != null)
            {
                RunSync(packageInfo, "check", true);
            }
        }

        private static PackageInfo FindPackage(bool showDialog)
        {
            var packageInfo = PackageInfo.FindForAssembly(Assembly.GetExecutingAssembly());
            if (packageInfo == null && showDialog)
            {
                EditorUtility.DisplayDialog("AI Agent Config", "Unable to locate the installed package.", "OK");
            }

            return packageInfo;
        }

        private static bool RunSync(PackageInfo packageInfo, string command, bool showDialog)
        {
            var scriptPath = Path.Combine(packageInfo.resolvedPath, "Scripts", "sync.mjs");
            var startInfo = new ProcessStartInfo
            {
                FileName = "node",
                Arguments = $"\"{scriptPath}\" {command}",
                WorkingDirectory = packageInfo.resolvedPath,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            try
            {
                using (var process = Process.Start(startInfo))
                {
                    var output = new StringBuilder();
                    output.Append(process.StandardOutput.ReadToEnd());
                    output.Append(process.StandardError.ReadToEnd());
                    process.WaitForExit();

                    if (process.ExitCode == 0)
                    {
                        UnityEngine.Debug.Log(output.ToString());
                        if (showDialog)
                        {
                            EditorUtility.DisplayDialog("AI Agent Config", "Synchronization completed. Restart active Claude Code and Codex sessions if needed.", "OK");
                        }
                        return true;
                    }

                    UnityEngine.Debug.LogError(output.ToString());
                    if (showDialog)
                    {
                        EditorUtility.DisplayDialog("AI Agent Config", "Synchronization failed. Open the Unity Console for details.", "OK");
                    }
                    return false;
                }
            }
            catch (Exception exception)
            {
                UnityEngine.Debug.LogException(exception);
                if (showDialog)
                {
                    EditorUtility.DisplayDialog("AI Agent Config", "Node.js 18 or newer is required and must be available on PATH.", "OK");
                }
                return false;
            }
        }
    }
}
