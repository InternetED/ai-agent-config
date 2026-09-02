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
        [MenuItem("Tools/AI Agent Config/Install or Update")]
        private static void Install()
        {
            RunSync("install --prune");
        }

        [MenuItem("Tools/AI Agent Config/Validate Package")]
        private static void ValidatePackage()
        {
            RunSync("check");
        }

        private static void RunSync(string command)
        {
            var packageInfo = PackageInfo.FindForAssembly(Assembly.GetExecutingAssembly());
            if (packageInfo == null)
            {
                EditorUtility.DisplayDialog("AI Agent Config", "Unable to locate the installed package.", "OK");
                return;
            }

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
                        EditorUtility.DisplayDialog("AI Agent Config", "Synchronization completed. Restart active Claude Code and Codex sessions if needed.", "OK");
                    }
                    else
                    {
                        UnityEngine.Debug.LogError(output.ToString());
                        EditorUtility.DisplayDialog("AI Agent Config", "Synchronization failed. Open the Unity Console for details.", "OK");
                    }
                }
            }
            catch (Exception exception)
            {
                UnityEngine.Debug.LogException(exception);
                EditorUtility.DisplayDialog("AI Agent Config", "Node.js 18 or newer is required and must be available on PATH.", "OK");
            }
        }
    }
}
