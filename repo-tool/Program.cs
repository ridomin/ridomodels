using Azure.DigitalTwins.Parser;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Xml;

namespace repo_tool
{
    class Program
    {
        static ModelParser modelParser = new ModelParser();
        static List<string> resolverPaths = new List<string>();
        static string rootInterface = string.Empty;
        static async Task Main(string[] args)
        {
            List<string> modelsContents = new List<string>();
            if (args.Length<1)
            {
                args = new string[] { "." };
            }
            string input = args[0];
            if (!File.Exists(input) && !Directory.Exists(input))
            {
                Console.WriteLine($"Error: '{input}' not found.");
                return;
            }

            if (File.Exists(input))
            {
                var inputFi = new FileInfo(input);
                rootInterface = inputFi.Name;
                resolverPaths.Add(inputFi.Directory.FullName);
                modelsContents.Add(File.ReadAllText(input));
            }
            if (Directory.Exists(input))
            {
                resolverPaths.Add(input);
                foreach(var file in  Directory.GetFiles(input))
                {
                    modelsContents.Add(File.ReadAllText(file));
                }
            }

            try
            {
                modelParser.DtmiResolver = DtmiResolver;
                var parsedDtmis = await modelParser.ParseAsync(modelsContents);
                var interfaces = parsedDtmis.Where(r => r.Value.EntityKind == DTEntityKind.Interface).ToList();
                foreach (var dt in interfaces)
                {
                    Console.WriteLine(dt.Key.AbsoluteUri + " " + dt.Value.DefinedIn);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            
            
        }

        static private async Task<IEnumerable<string>> DtmiResolver(IReadOnlyCollection<Dtmi> dtmis)
        {
            List<String> jsonLds = new List<string>();
            //other files in local folder as the root interface
            //foreach (var item in resolverPaths)
            //{
            //    foreach (var f in Directory.GetFiles(item))
            //    {
            //        if (!f.Contains("model-manifest.json") && !f.Contains(rootInterface))
            //        { 
            //            jsonLds.Add(File.ReadAllText(f));
            //        }
            //    }
            //}


            foreach (var dtmi in dtmis)
            {
                GetModel(dtmi.AbsoluteUri);
            }

            return await Task.FromResult(allModels.Values.ToList<string>());
        }
        
        static IDictionary<string, string> allModels = new Dictionary<string, string>();

        static void GetModel(string dtmi)
        {
            Console.WriteLine(". . . downloading " + dtmi);

            string dtmi2Folder(string dtmi)
            {
                var allparts = dtmi.ToLower().Split(";")[0].Split(":");
                var parts = allparts.Skip(1);
                return string.Join("-", parts);
            }

            string folder = dtmi2Folder(dtmi);
            string url = "https://ridomin.github.io/ridomodels/models/";

            var wc = new WebClient();
            var manifest = wc.DownloadString(new Uri(url +$"{folder}/model-manifest.json"));
            var manifestItems = JsonConvert.DeserializeObject<IEnumerable<ManifestItem>>(manifest);
            var root = manifestItems.Where(mi => mi.dtmi == dtmi).FirstOrDefault();
            if (!allModels.ContainsKey(dtmi))
            { 
                allModels.Add(dtmi, wc.DownloadString(url + $"{folder}/{root.path}"));
            }
            foreach (var d in root.depends)
            {
                GetModel(d);
            }
        }
    }

    class ManifestItem
    {
        public string dtmi { get; set; }
        public string path { get; set; }
        public string owner { get; set; }
        public IEnumerable<string> depends { get; set; } = new List<string>();
    }
}
