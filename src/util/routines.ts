import { TradfriClient } from "./tradfri"
import { ILightConfig, LightConfigBuilder } from "./LightConfig"

export class Routine {

    client: TradfriClient

    constructor(client: TradfriClient) {
        this.client = client
    }


    rand(i: number): number {
        return Math.floor(Math.random() * i)
    }

    async tivoliLightsSync() {
        await this.startLights()
        setInterval(() => {
            let r = this.rand(255).toString(16);
            let g = this.rand(255).toString(16);
            let b = this.rand(255).toString(16);
            let d = this.rand(30) + 20;

            const confBuilder = new LightConfigBuilder()
            confBuilder.setTransitionTime = 0
            confBuilder.dimmerLevel = d
            confBuilder.safeSetColor(r + g + b)

            const conf = confBuilder.build()

            this.applyUnsafe(conf)
        }, 3000)
    }

    halloween = async () => {
        await this.startLights()
        const confBuilder = (new LightConfigBuilder)
        confBuilder.setLightsStatus = true
        confBuilder.safeSetColor("FF8000")
        confBuilder.dimmerLevel = 20
        const conf = confBuilder.build()
        this.apply(conf)
    }


    tivoliLightsAsync = async () => {
        await this.startLights()
        var cli = await this.client
        setInterval(() => {
            cli.getBulbs().forEach((e: any) => {
                let r = this.rand(255).toString(16);
                let g = this.rand(255).toString(16);
                let b = this.rand(255).toString(16);
                let d = this.rand(30) + 20;

                const confBuilder = new LightConfigBuilder()
                confBuilder.setTransitionTime = 0
                confBuilder.dimmerLevel = d
                confBuilder.safeSetColor(r + g + b)

                const conf = confBuilder.build()
                this.client.setLight(e, conf)
            })
        }, 300)
    }

    turnOff = async () => {
        const confBuilder = new LightConfigBuilder
        confBuilder.setLightsStatus = false
        const conf = confBuilder.build()
        this.apply(conf)
    }

    turnOn = async () => {
        const confBuilder = new LightConfigBuilder
        confBuilder.setLightsStatus = true
        const conf = confBuilder.build()
        this.apply(conf)
    }

    startLights = async () => {
        const confBuilder = new LightConfigBuilder()
        confBuilder.setLightsStatus = true
        confBuilder.dimmerLevel = 100
        confBuilder.safeSetColor('FFFFFF')
        const conf = confBuilder.build()

        await this.client.getBulbs().forEach((e: any) => this.client.setLight(e, conf))
    }

    apply = async (config: ILightConfig) => {
        await this.startLights()
        this.applyUnsafe(config)
    }

    // may cause synchronization bugs when used without startLights. **should not be exported**.
    private applyUnsafe = async (config: ILightConfig) => {
        // bulbs are unfortunately disregarding requests at times. may need to spam a couple of times.
        await this.client.getBulbs().forEach((e: any) => this.client.setLight(e, config))
    }

}
