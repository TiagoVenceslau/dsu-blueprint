import {constructFromObject} from "@tvenceslau/db-decorators/lib";
import {email} from "@tvenceslau/decorator-validation/lib";
import {DbDsuBlueprint, dsu, DSUBlueprint, dsuFile, DSUModel, environment, fromCache, wallet} from "../core";
import {addFileFS, addFolderFS, dsuFS} from "../fs";
import {KeySSIType} from "../core/opendsu/apis/keyssi";

@DSUBlueprint(undefined, KeySSIType.SEED)
export class IdDsuBlueprint extends DSUModel{

    @dsuFile()
    name?: string = undefined;
    @dsuFile()
    id?: string = undefined;
    @dsuFile()
    @email()
    email?: string = undefined;
    @dsuFile()
    address?: string = undefined;

    constructor(blueprint?: IdDsuBlueprint | {}) {
        super();
        constructFromObject<IdDsuBlueprint>(this, blueprint);
    }
}

@DSUBlueprint(undefined, KeySSIType.ARRAY)
export class ParticipantDsuBlueprint extends DSUModel{

    // @ts-ignore
    @fromCache(IdDsuBlueprint, true)
    id?: IdDsuBlueprint = undefined;

    constructor(blueprint?: ParticipantDsuBlueprint | {}) {
        super();
        constructFromObject<ParticipantDsuBlueprint>(this, blueprint);
    }
}

@DSUBlueprint(undefined)
export class BuildDsuBlueprint extends DSUModel{

    @addFileFS("bin/init.file", "init.file")
    init?: any = undefined;

    @addFolderFS('lib')
    code?: any = undefined;

    @dsuFS("../webcardinal", true)
    webcardinal?: any = undefined;

    @dsuFS("../themes/*", true)
    themes?: any[] = undefined;

    constructor(blueprint?: BuildDsuBlueprint | {}) {
        super();
        constructFromObject<BuildDsuBlueprint>(this, blueprint);
    }
}

@DSUBlueprint(undefined, KeySSIType.SEED)
export class SSAppDsuBlueprint extends DSUModel{

    // @ts-ignore
    @dsu<IdDsuBlueprint>(IdDsuBlueprint)
    id?: IdDsuBlueprint = undefined;

    @dsu<ParticipantDsuBlueprint>(ParticipantDsuBlueprint, false, undefined, undefined, ["id.id", "id.name", "id.address", "id.email"])
    participant?: ParticipantDsuBlueprint = undefined;

    @dsu<DbDsuBlueprint>(DbDsuBlueprint)
    db?: DbDsuBlueprint = undefined;

    @dsuFS("../demo-ssapp", true)
    code?: any = undefined;

    constructor(blueprint?: SSAppDsuBlueprint | {}) {
        super();
        constructFromObject<SSAppDsuBlueprint>(this, blueprint);
        this.id = new IdDsuBlueprint(this.id);
        this.participant = new ParticipantDsuBlueprint(this.participant);
        this.db = new DbDsuBlueprint(this.participant);
    }
}

@DSUBlueprint(undefined, KeySSIType.WALLET, undefined, undefined, true, "id.id", "id.name", "id.address", "id.email")
export class SSAppWebDsuBlueprint extends DSUModel{

    // @ts-ignore
    @dsu<IdDsuBlueprint>(IdDsuBlueprint)
    id?: IdDsuBlueprint = undefined;

    @dsu<ParticipantDsuBlueprint>(ParticipantDsuBlueprint, false, undefined, undefined, ["id.id", "id.name", "id.address", "id.email"])
    participant?: ParticipantDsuBlueprint = undefined;

    @dsu<DbDsuBlueprint>(DbDsuBlueprint)
    db?: DbDsuBlueprint = undefined;

    @wallet("dsu-explorer")
    code?: string = undefined;

    @environment()
    environment?: {} = undefined;

    constructor(blueprint?: SSAppWebDsuBlueprint | {}) {
        super();
        constructFromObject<SSAppWebDsuBlueprint>(this, blueprint);
        this.id = new IdDsuBlueprint(this.id);
        this.participant = new ParticipantDsuBlueprint(this.participant);
        this.db = new DbDsuBlueprint(this.participant);
    }
}