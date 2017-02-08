using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using Newtonsoft.Json;
using Xamarin.UITest;
using Xamarin.UITest.Queries;

namespace ReproIssues.UITests
{
    public class PinchToZoomPage
    {
        private IApp _app;

        public PinchToZoomPage(IApp app)
        {
            _app = app;
        }

        public void WaitUntilLoaded()
        {
            _app.WaitForElement(x => x.WebView().Css("#pinchToZoomHeader"), timeout: TimeSpan.FromSeconds(5));
            _app.Screenshot("Pinch To Zoom screen loaded");

            _app.WaitForElement(x => x.WebView().Css("#ptzviewer img"), timeout: TimeSpan.FromSeconds(5));
            _app.Screenshot("Pinch To Zoom image loaded");
        }

        public void ZoomInOnImage(int imageIndex)
        {
            var rect = _app.Query(x => x.WebView().Css(".image-viewer"))[imageIndex].Rect;
            _app.PinchToZoomInCoordinates(rect.CenterX, rect.CenterY, new TimeSpan(10000 * 500));
            _app.Screenshot("Now I zoom in on the image");
        }

        public AppWebResult GetImageTag(int imageIndex)
        {
            var results = _app.Query(x => x.WebView().Css(".image-display"));

            if (results.Length > imageIndex)
            {
                return _app.Query(x => x.WebView().Css(".image-display"))[imageIndex];
            }

            return null;
        }

        public string GetImageTransform(int imageIndex)
        {
            var result = GetImageTag(imageIndex);

            if (result != null)
            {
                var transform = this.GetStyle(result, "transform");

                if (transform == null)
                {
                    transform = this.GetStyle(result, "-webkit-transform");
                }

                return transform;
            }
            else
            {
                return null;
            }
        }

        public Scale GetImageScale(int imageIndex)
        {
            var transform = GetImageTransform(imageIndex);

            if (!string.IsNullOrWhiteSpace(transform))
            {
                var scaleIndex = transform.IndexOf("scale(");

                if (scaleIndex > 0)
                {
                    var scaleSubstring = transform.Substring(scaleIndex + 6);

                    var endOffset = scaleSubstring.IndexOf(")");

                    scaleSubstring = scaleSubstring.Substring(0, endOffset);

                    var split = scaleSubstring.Split(',');

                    if (split.Length == 2)
                    {
                        return new Scale()
                        {
                            Height = double.Parse(split[0].Trim()),
                            Width = double.Parse(split[1].Trim())
                        };
                    }
                }
            }

            return null;
        }

        private string GetAttribute(AppWebResult webResult, string attributeName)
        {
            if (_app.GetPlatform() == Platform.iOS)
            {
                var data = new
                {
                    operation = new
                    {
                        arguments = new object[]
                        {
                            new
                            {
                                stringByEvaluatingJavaScriptFromString = "$('.image-display')[0].outerHTML"
                            }
                        },
                        method_name = "query"
                    },
                    query = "webView"
                };
                var jsonResult = _app.TestServer.Post("/map", data);
                var htmlString = new { results = new String[] { } };
                var htmlElement = new HtmlDocument();
                htmlElement.LoadHtml(JsonConvert.DeserializeAnonymousType(jsonResult, htmlString).results.First());
                return htmlElement.DocumentNode.FirstChild.GetAttributeValue(attributeName, string.Empty);
            }
            else
            {
                var htmlElement = new HtmlDocument();
                htmlElement.LoadHtml(webResult.Html);
                return htmlElement.DocumentNode.FirstChild.GetAttributeValue(attributeName, string.Empty);
            }
        }

        private Dictionary<string, string> GetStyles(AppWebResult webResult)
        {
            var parsedDictionary = new Dictionary<string, string>();

            foreach (var styleValue in this.GetAttribute(webResult, "style").Split(';'))
            {
                var splitValue = styleValue.Split(':');

                if (splitValue.Count() == 2)
                {
                    parsedDictionary.Add(splitValue[0].Trim(), splitValue[1].Trim());
                }
            }

            return parsedDictionary;
        }

        private string GetStyle(AppWebResult webResult, string styleKey)
        {
            var dictionary = this.GetStyles(webResult);

            if (dictionary.ContainsKey(styleKey))
            {
                return dictionary[styleKey];
            }

            return null;
        }
    }

    public class Scale
    {
        public double Height { get; set; }
        public double Width { get; set; }
    }
}
