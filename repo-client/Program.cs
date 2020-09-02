using Azure.DigitalTwins.Parser;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace repo_client
{
    class ModelIndex
    {
        public string repoName { get; set; }
        public string lastUpdate { get; set; }
        public IEnumerable<ManifestItem> models { get; set; }
    }

    class ManifestItem
    {
        public string dtmi { get; set; }
        public string path { get; set; }
        public string owner { get; set; }
        public IEnumerable<string> depends { get; set; } = new List<string>();
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.WriteLine("Usage: repo-client <dtmi>");
                return;
            }
            string rootDtmi = args[0];
            GetModel(rootDtmi);

            ModelParser parser = new ModelParser();

            try
            {
                //modelParser.DtmiResolver = LocalDtmiResolver;
                var parsedDtmis = await parser.ParseAsync(allModels.Values);
                var interfaces = parsedDtmis.Where(r => r.Value.EntityKind == DTEntityKind.Interface).ToList();
                foreach (var dt in interfaces)
                {
                    Console.WriteLine(dt.Key.AbsoluteUri + " " + dt.Value.DefinedIn);
                    var ifcs = parsedDtmis.Where(r => r.Value.DefinedIn == dt.Key);
                    foreach (var i in ifcs)
                    {
                        Console.WriteLine(i.Value.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        static IDictionary<string, string> allModels = new Dictionary<string, string>();
        static ModelIndex modelIndex = null;

        static void GetModel(string dtmi)
        {
            Console.WriteLine(". . . resolving " + dtmi);
            //string url = "https://ridomin.github.io/ridomodels/";
            string url = "http://127.0.0.1:5500/";
            var wc = new WebClient();
            if (modelIndex == null)
            {
                string manifestUrl = url + $"model-index.json";
                var manifest = wc.DownloadString(new Uri(manifestUrl));

                Console.WriteLine("Found:" + manifestUrl);
                modelIndex = JsonConvert.DeserializeObject<ModelIndex>(manifest);
            }

            var root = modelIndex.models.Where(m => m.dtmi == dtmi).FirstOrDefault();
            if (!allModels.ContainsKey(dtmi))
            {
                allModels.Add(dtmi, wc.DownloadString(url + $"{root.path}"));
            }
            foreach (var d in root.depends)
            {
                GetModel(d);
            }
        }
    }
}