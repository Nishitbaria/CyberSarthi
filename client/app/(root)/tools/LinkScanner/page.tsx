"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    GlobeIcon,
    LockIcon,
    ServerIcon,
    CodeIcon,
    BarChartIcon,
    SearchIcon,
    ShieldIcon,
    AlertTriangleIcon,
    ActivityIcon,
    EyeIcon,
} from "lucide-react";

interface ScanResult {
    message: string;
    uuid: string;
    result: string;
    api: string;
    visibility: string;
    options: Record<string, unknown>;
    url: string;
}

interface SearchResultPage {
    country: string;
    server: string;
    ip: string;
    mimeType: string;
    title: string;
    url: string;
    tlsValidDays: number;
    tlsAgeDays: number;
    tlsValidFrom: string;
    domain: string;
    apexDomain: string;
    asnname: string;
    asn: string;
    tlsIssuer: string;
    status: string;
}

interface SearchResultTask {
    visibility: string;
    method: string;
    domain: string;
    apexDomain: string;
    time: string;
    uuid: string;
    url: string;
}

interface SearchResultStats {
    uniqIPs: number;
    uniqCountries: number;
    dataLength: number;
    encodedDataLength: number;
    requests: number;
}

interface SearchResult {
    task: SearchResultTask;
    stats: SearchResultStats;
    page: SearchResultPage;
    _id: string;
    result: string;
    screenshot: string;
}

export default function WebsiteAnalysis() {
    const [url, setUrl] = useState<string>("");
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleScan = async (urlToScan: string = url) => {
        setIsLoading(true);
        try {
            const formattedUrl =
                urlToScan.startsWith("http://") || urlToScan.startsWith("https://")
                    ? urlToScan
                    : `https://${urlToScan}`;

            const response = await fetch("/api/urlscan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: formattedUrl }),
            });
            const data = await response.json();
            setScanResult(data.scanResult);
            setSearchResult(data.searchResult);
        } catch (error) {
            console.error("Error scanning URL:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
            <div className="container mx-auto p-4">
                <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl font-bold mb-2">
                            LinkScanner
                        </CardTitle>
                        <CardDescription className="text-lg mb-6">
                            Analyze and secure your web links
                        </CardDescription>
                        <div className="flex justify-center items-center space-x-2 max-w-2xl mx-auto">
                            <Input
                                placeholder="Enter URL to scan"
                                value={url}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setUrl(e.target.value)
                                }
                                className="w-full text-lg"
                            />
                            <Button
                                onClick={() => handleScan()}
                                disabled={isLoading}
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? "Scanning..." : "Scan"}
                                <SearchIcon className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <ShieldIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                                <h3 className="font-semibold">Malicious Behavior Detection</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Identifies phishing and scam content
                                </p>
                            </div>
                            <div>
                                <ActivityIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                                <h3 className="font-semibold">Comprehensive Analysis</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Examines network activity and page content
                                </p>
                            </div>
                            <div>
                                <EyeIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                                <h3 className="font-semibold">Visual Reporting</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Provides screenshots and detailed insights
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {searchResult && (
                    <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg">
                        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-3xl font-bold">
                                    {searchResult.page.domain}
                                </CardTitle>
                                <CardDescription className="text-lg">
                                    {searchResult.page.title}
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(searchResult.result, "_blank")}
                                >
                                    View Full Report
                                    <BarChartIcon className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(searchResult.page.url, "_blank")}
                                >
                                    Visit Site
                                    <GlobeIcon className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => handleScan()}>
                                    Rescan
                                    <SearchIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Badge variant="secondary" className="text-sm">
                                    <ServerIcon className="mr-1 h-3 w-3" />
                                    {searchResult.page.ip}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    <GlobeIcon className="mr-1 h-3 w-3" />
                                    {searchResult.page.country}
                                </Badge>
                                <Badge variant="secondary" className="text-sm">
                                    <ShieldIcon className="mr-1 h-3 w-3" />
                                    Public Scan
                                </Badge>
                            </div>
                            <Alert>
                                <AlertTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Scan Summary</AlertTitle>
                                <AlertDescription>
                                    This scan analyzed the URL for potential security risks.
                                    Always exercise caution when visiting unfamiliar websites.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}

                {searchResult && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <Tabs defaultValue="summary" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                    <TabsTrigger value="network">Network</TabsTrigger>
                                    <TabsTrigger value="security">Security</TabsTrigger>
                                    <TabsTrigger value="content">Content</TabsTrigger>
                                </TabsList>
                                <TabsContent value="summary">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Scan Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-2">
                                                This website contacted{" "}
                                                <strong>{searchResult.stats.uniqIPs}</strong> IPs in{" "}
                                                <strong>{searchResult.stats.uniqCountries}</strong>{" "}
                                                countries to perform{" "}
                                                <strong>{searchResult.stats.requests}</strong> HTTP
                                                transactions.
                                            </p>
                                            <p className="mb-2">
                                                The main IP is <strong>{searchResult.page.ip}</strong>,
                                                located in <strong>{searchResult.page.country}</strong>{" "}
                                                and belongs to{" "}
                                                <strong>{searchResult.page.asnname}</strong>.
                                            </p>
                                            <p className="mb-2">
                                                The main domain is{" "}
                                                <strong>{searchResult.page.domain}</strong>.
                                            </p>
                                            <p>
                                                TLS certificate: Issued by{" "}
                                                <strong>{searchResult.page.tlsIssuer}</strong> on{" "}
                                                <strong>
                                                    {new Date(
                                                        searchResult.page.tlsValidFrom
                                                    ).toLocaleDateString()}
                                                </strong>
                                                . Valid for:{" "}
                                                <strong>{searchResult.page.tlsValidDays}</strong> days.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="network">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Network Activity</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-2">
                                                <strong>Server:</strong> {searchResult.page.server}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Status:</strong> {searchResult.page.status}
                                            </p>
                                            <p className="mb-2">
                                                <strong>MIME Type:</strong> {searchResult.page.mimeType}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Data Transferred:</strong>{" "}
                                                {searchResult.stats.dataLength} bytes
                                            </p>
                                            <p>
                                                <strong>Encoded Data:</strong>{" "}
                                                {searchResult.stats.encodedDataLength} bytes
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="security">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Security Indicators</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-2">
                                                <strong>ASN:</strong> {searchResult.page.asn}
                                            </p>
                                            <p className="mb-2">
                                                <strong>ASN Name:</strong> {searchResult.page.asnname}
                                            </p>
                                            <p className="mb-2">
                                                <strong>TLS Issuer:</strong>{" "}
                                                {searchResult.page.tlsIssuer}
                                            </p>
                                            <p>
                                                <strong>TLS Valid Until:</strong>{" "}
                                                {new Date(
                                                    new Date(searchResult.page.tlsValidFrom).getTime() +
                                                    searchResult.page.tlsValidDays * 24 * 60 * 60 * 1000
                                                ).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="content">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Page Content</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-2">
                                                <strong>Page Title:</strong> {searchResult.page.title}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Domain:</strong> {searchResult.page.domain}
                                            </p>
                                            <p>
                                                <strong>Apex Domain:</strong>{" "}
                                                {searchResult.page.apexDomain}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visual Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative aspect-video mb-4">
                                        <Image
                                            src={searchResult.screenshot}
                                            alt="Website Screenshot"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Scan Statistics</h3>
                                        <p>
                                            <strong>Unique IPs:</strong> {searchResult.stats.uniqIPs}
                                        </p>
                                        <p>
                                            <strong>Countries:</strong>{" "}
                                            {searchResult.stats.uniqCountries}
                                        </p>
                                        <p>
                                            <strong>Requests:</strong> {searchResult.stats.requests}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}