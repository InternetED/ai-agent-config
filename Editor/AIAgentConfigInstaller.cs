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
    [InitializeOnLoad]
    internal static class AIAgentConfigInstaller
    {
        private const string AutoInstalledVersionKey = "InternetED.AIAgentConfig.AutoInstalledVersion";
        private const string AutoInstallAttemptedSessionKeyPrefix = "InternetED.AIAgentConfig.AutoInstallAttempted.";

        static AIAgentConfigInstaller()
        {
            EditorApplication.delayCall += AutoInstall;
        }

        private static void AutoInstall()
        {
            EditorApplication.delayCall -= AutoInstall;

            var packageInfo = PackageInfo.FindForAssembly(Assembly.GetExecutingAssembly());
            if (packageInfo == null)
            {
                UnityEngine.Debug.LogError("AI Agent Config could not locate its installed package, so automatic synchronization was skipped.");
                return;
            }

            var sessionKey = AutoInstallAttemptedSessionKeyPrefix + packageInfo.version;
            if (SessionState.GetBool(sessionKey, false))
            {
                return;
            }

            SessionState.SetBool(sessionKey, true);
            if (EditorPrefs.GetString(AutoInstalledVersionKey, string.Empty) == packageInfo.version)
            {
                return;
            }

            if (RunSync(packageInfo, "install --prune", false))
            {
                EditorPrefs.SetString(AutoInstalledVersionKey, packageInfo.version);
                UnityEngine.Debug.Log($"AI Agent Config {packageInfo.version} was automatically synchronized for Claude Code and Codex.");
            }
        }

        [MenuItem("Tools/AI Agent Config/Install or Update")]
        private static void Install()
        {
            var packageInfo = FindPackage(true);
            if (packageInfo != null && RunSync(packageInfo, "install --prune", true))
            {
                EditorPrefs.SetString(AutoInstalledVersionKey, packageInfo.version);
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
