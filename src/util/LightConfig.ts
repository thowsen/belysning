
export interface ILightConfig {
    lightsOn: boolean
    dimmerLevel: number
    color: string
    transitionTime: number
}

export class LightConfigBuilder {
    private _lightsOn: boolean = true;
    private _dimmer: number = 50;
    private _color: string = "0f1adb";  // Should not include the hashtag
    private _transitionTime: number = 0;

    // Nested class since typescript seemingly doesn't allow private classes in other forms.
    private static _LightConfig = class implements ILightConfig {
        //config values: 
        //    onOff : boolpriv
        //    dimmer : 0-100
        //    color : hexcode (example F12C3B)
        //    transitionTime : milliseconds
        private _lightsOn: boolean;
        private _dimmerLevel: number;
        private _colorCode: string;
        private _transitionTime: number;

        constructor(lightsOn: boolean, dimmer: number, color: string, transitionTime: number) {
            this._lightsOn = lightsOn
            this._dimmerLevel = dimmer
            this._colorCode = color
            this._transitionTime = transitionTime
        }

        get lightsOn(): boolean {
            return Boolean(this._lightsOn)
        }

        get dimmerLevel(): number {
            return this._dimmerLevel
        }

        get color(): string {
            return this._colorCode
        }

        get transitionTime(): number {
            return this._transitionTime
        }
    }

    set setLightsStatus(status: boolean) {
        this._lightsOn = status
    }

    set dimmerLevel(level: number) {
        this._dimmer = level
    }

    set setTransitionTime(time: number) {
        this._transitionTime = time
    }

    safeSetColor: (hex: string) => boolean = (hex) => {
        if (this.checkColorHex(hex)) {
            this._color = hex.slice(1)
            return true
        }
        return false
    }


    build: () => ILightConfig = () => {
        return new LightConfigBuilder._LightConfig(this._lightsOn, this._dimmer, this._color, this._transitionTime)
    }

    private checkColorHex: (hex: string) => boolean = hex => {
        const rgx = /\#[A-Fa-f0-9]{6}/g
        const rg = rgx.exec(hex)
        return Boolean(hex.length === 7 && rg && rg[0] === hex)
    }

}


