// 🪳

import { TradfriClient } from "./tradfri"
import { Routine } from "./routines"
import { ILightConfig } from "./LightConfig"

export default class Belysning {
    client: any
    routines: Routine
    static singleton: Belysning | undefined = undefined

    private constructor(client: any) {
        this.client = client
        this.routines = new Routine(client)
    }

    static getInstance: () => Promise<Belysning> = async () => {
        if (!Belysning.singleton) {
            var client = await TradfriClient.getInstance()
            Belysning.singleton = new Belysning(client)
        }
        return Belysning.singleton
    }

    apply: (config: ILightConfig) => Promise<void> = async (config: ILightConfig) => {
        await this.routines.apply(config)
    }
}