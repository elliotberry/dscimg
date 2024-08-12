import ConfigurationStation from "configuration-station"
const config = new ConfigurationStation({
    appName: "dscimg",
    config: {
        cloudflareAIToken: "string",
        cloudflareEndpoint: "string",
    },
})

export default config
