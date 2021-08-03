import {Connection, EntityManager, IDatabaseDriver} from "@mikro-orm/core";

export type EMContext = {
    em:  EntityManager<IDatabaseDriver<Connection>>
}
