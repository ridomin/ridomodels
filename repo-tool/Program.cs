using Azure.DigitalTwins.Parser;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace repo_tool
{
    class Program
    {
        static ModelParser modelParser = new ModelParser();
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
                modelsContents.Add(File.ReadAllText(input));
            }
            if (Directory.Exists(input))
            {
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
            foreach (var dtmi in dtmis)
            {
                Console.WriteLine("Resolver looking for. " + dtmi);
                string model = "";//await ModelRepo.GetMissingModel(dtmi.AbsoluteUri);
                if (!String.IsNullOrWhiteSpace(model))
                {
                    jsonLds.Add(model);
                }
            }
            return jsonLds;
        }
    }
}
