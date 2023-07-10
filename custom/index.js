/**
 * Remove a div do elemento parente
 * @param {HTMLElement} element
 * @param {number} depth
 * @param {number} offset
 * @returns {void}
 */
function retirarDiv(element, depth = 1, offset = 0)
{
    for (let i = 0; i < depth; i++) {
        element = element.parentElement;
    }
    
    const type = element.dataset.templateType;
    if (!conditions.hasOwnProperty(type)) {
        element.remove();
        removeFromPool(element);
    }
    
    let parentElement = element.parentElement;
    const siblings = Array.from(parentElement.children);
    const index = siblings.indexOf(element) - offset;
    let idElement;
    while (!(idElement = parentElement.parentElement.querySelector("[data-id]"))) {
        parentElement = parentElement.parentElement;
    }
    const id = idElement.dataset.id
    element.remove();
    console.log(`conditions[${type}].delete(idElement, ${id}, ${index});`)
    console.log(idElement)
    conditions[type].delete(idElement, id, index);
    return
}

/**
 * Remove da pool pelo elemento parente
 * @param {HTMLElement} element
 * @returns {void}
*/
function removeFromPool(element) {
    const idElement = element.querySelector("[data-id]")
    if (!idElement) {
        return;
    }
    
    const type = element.dataset.templateType;
    if (!type) {
        return;
    }
    /**
     * @type {{
     * idPool: Set<string>
     * add: (id: string) => void
     * edit: (id: string, newId: string) => void
     * delete: (id: string) => void
     * }|{
     * idPool: Set<number>
     * add: (id: number) => void
     * delete: (id: number) => void
     * }=}
     */
    const pool = pools[type];
    if (!pool) {
        return;
    }
    const id = idElement.dataset.id;
    const idNum = parseInt(id);
    
    pool.delete(id);
    if (isNaN(idNum)) {
        pool.idPool.delete(id);
        return;
    }
    pool.idPool.delete(idNum);
}

/**
 * @param {HTMLElement} element 
 * @param {Object.<string, string>} object 
 * @param {boolean} useId
 * @param {string=} key
 * @param {boolean} filterById
 * @returns {void}
 */
function set(element, object, useId = false, key, filterById = false) {
    if (!useId) {
        object[key] = element.value;
        return;
    }

    const id = element.parentElement.querySelector('[data-id]').dataset.id;
    if (filterById) {
        obj = object.find(e => e.id == id);
        obj[key] = element.value;
        return;
    }
    if (key) {
        object[id][key] = element.value;
        return;
    }

    object[id] = element.value;
    return;
}

/**
 * 
 * @param {HTMLElement} idElement 
 * @param {HTMLElement} levelElement 
 * @returns {boolean}
 */
function isIdElementActuallyALevelElement(idElement, levelElement) {
    const commonParentForIds = idElement?.parentElement?.parentElement?.parentElement;
    const isIdALevel = commonParentForIds == levelElement?.parentElement?.parentElement?.parentElement;
    return isIdALevel;
}

/**
 * @param {HTMLElement} element 
 * @param {Pericias} object 
 * @param {number} offset 
 * @param {string} key
 * @param {boolean} atConditions
 * @param {boolean} useDefaultLevel
 * @returns {void}
 */
function setCondition(element, object, offset, key, atConditions, useDefaultLevel) {
    let levelElement;
    if (useDefaultLevel) {
        levelElement = "value";
    }
    let idElement;
    
    let parentElement = element.parentElement;
    const siblings = Array.from(parentElement.parentElement.children);
    const index = siblings.indexOf(element.parentElement) - offset;

    while (true) {
        idElement = parentElement.querySelector("[data-id]");
        if (!idElement) {
            parentElement = parentElement.parentElement;
            continue;
        }

        if (!levelElement) {
            levelElement = idElement;
            continue;
        }
        
        if (!isIdElementActuallyALevelElement(idElement, levelElement)) {
            break;
        }

        parentElement = parentElement.parentElement;
    }
    /**
     * @type {string}
     */
    const id = idElement.dataset.id;
    /**
     * @type {string}
     */
    const level = levelElement.dataset?.id ?? levelElement;
    console.log(id);
    console.log(level);
    const attribute = object.find(e => e.id == id);
    console.log(attribute);
    const attributeAtLevel = attribute[level];
    console.log(attributeAtLevel);
    let condition = attributeAtLevel[index];
    console.log(condition);
    if (atConditions) {
        condition = condition.conditions[0];
    }
    console.log(condition);
    condition[key] = element.value;
    return;
}

/**
 * @param {HTMLElement} idElement 
 * @param {"status"|"attribute"|"condition_attribute"|"expertise"|"condition_expertise"|"expertise_level"|"language"|"condition_group_expertise"} type
 * @param {string=} editTo
 * @returns {void}
 */
function addToPool(idElement, type, editTo) {
    if (editTo === "") {
        return;
    }

    let id = idElement.dataset.id;
    const idNum = parseInt(id);
    id = isNaN(idNum) ? id : idNum;
    delete idNum;
    
    /**
     * @type {{
     * idPool: Set<string>
     * add: (id: string) => void
     * edit: (id: string, newId: string) => void
     * delete: (id: string) => void
     * }|{
     * idPool: Set<number>
     * add: (id: number) => void
     * delete: (id: number) => void
     * }=}
     */
    const pool = pools[type];
    
    if (!pool) {
        return;
    }

    if (!editTo) {
        while (pool.idPool.has(id)) {
            id++;
        }
        editTo = id;
        pool.add(editTo);
        idElement.innerText = idElement.innerText.replace("{}", editTo);
    }
    else {
        pool.idPool.delete(id);
        pool.edit(id, editTo);
    }

    pool.idPool.add(editTo);
    if (editTo != id && pool.idPool.has(id)) {
        return;
    }
    idElement.dataset.id = editTo;
}

/**
 * Adiciona a div do tipo especificado
 * @param {HTMLElement} element
 * @param {"status"|"attribute"|"condition_attribute"|"expertise"|"condition_expertise"|"expertise_level"|"language"|"condition_group_expertise"} type
 * @returns {void}
 */
function tryAddCondition(element, type) {
    console.log(type);
    if (!conditions.hasOwnProperty(type)) {
        return;
    }

    let parentElement = element.parentElement;
    let idElement;
    while (!(idElement = parentElement.parentElement.querySelector("[data-id]"))) {
        parentElement = parentElement.parentElement;
    }
    const id = idElement.dataset.id;
    conditions[type].add(idElement, id);
}

/**
 * Adiciona a div do tipo especificado
 * @param {HTMLElement} element
 * @param {"status"|"attribute"|"condition_attribute"|"expertise"|"condition_expertise"|"expertise_level"|"language"|"condition_group_expertise"} type
 * @returns {void}
 */
function adicionarDiv(element, type)
{
    /**
     * @type {HTMLElement}
     */
    const template = templates[type].cloneNode(true);
    
    element.parentElement.insertBefore(template, element);
    const idElement = template.querySelector("[data-id]");
    tryAddCondition(element, type);

    if (!idElement) {
        return;
    }
    

    addToPool(idElement, type);

    const conditionsParent = template.querySelector(".expertise-conditions-parent");
    if (!conditionsParent) {
        return;
    }

    conditionsParent.dispatchEvent(new Event("change"));
}

/**
 * Adiciona a div do tipo especificado
 * @param {HTMLElement} element
 * @param {"status"|"attribute"|"condition_attribute"|"expertise"|"condition_expertise"|"expertise_level"|"language"|"condition_group_expertise"} type
 * @returns {void}
 */
function populateWithGroup(element, type) {
    const usedIds = Array.from(element.querySelectorAll("[data-id]")).map(e => e.dataset.id);
    for (const nivel of niveisPericias) {
        if (usedIds.includes(nivel.id)) {
            continue;
        }
        /**
         * @type {HTMLElement}
         */
        const template = templates[type].cloneNode(true);
        element.appendChild(template);
        const idElement = template.querySelector("[data-id]");
        
        if (!idElement) {
            continue;
        }

        idElement.dataset.id = nivel.id;
        idElement.innerText = idElement.innerText.replace("{}", nivel.id)
    }
}

const conditions = {
    condition_attribute: {
        /**
         * @param {HTMLElement} idElement
         * @param {number} id
         * @returns {void}
         */
        add(idElement, id) {
            const atributo = atributos.find(atributo => atributo.id == id);
            atributo.value.splice(atributo.value.length - 1, 0, {
                conditions: [{
                    type: "ge",
                    left: "",
                    right: ""
                }],
                dice: ""
            });
        },
        /**
         * @param {HTMLElement} idElement
         * @param {number} id
         * @param {number} index
         * @returns {void}
         */
        delete(idElement, id, index) {
            const atributo = atributos.find(atributo => atributo.id == id);
            atributo.value.splice(index, 1);
        }
    },
    condition_expertise: {
        /**
         * @param {HTMLElement} idElement
         * @param {string} level
         * @returns {void}
         */
        add(levelElement, level) {
            let idElement = levelElement;
            let parentElement = idElement.parentElement;

            while (true) {
                idElement = parentElement.querySelector("[data-id]")
                if (idElement && !isIdElementActuallyALevelElement(idElement, levelElement)) {
                    break;
                }
                parentElement = parentElement.parentElement;
            }
            const id = idElement.dataset.id

            const pericia = pericias.find(pericia => pericia.id == id);
            console.log(id)
            console.log(level)
            console.log(pericia)
            console.log(pericia[level])
            pericia[level].splice(pericia[level].length - 1, 0, {
                conditions: [{
                    type: "ge",
                    left: "",
                    right: ""
                }],
                dice: ""
            });
        },
        /**
         * @param {HTMLElement} levelElement
         * @param {string} level
         * @param {number} index
         * @returns {void}
         */
        delete(levelElement, level, index) {
            let idElement = levelElement;
            let parentElement = idElement.parentElement;

            while (true) {
                idElement = parentElement.querySelector("[data-id]")
                if (idElement && isIdElementActuallyALevelElement(idElement, levelElement)) {
                    break;
                }
                parentElement = parentElement.parentElement;
            }
            const id = idElement.dataset.id

            const pericia = pericias.find(pericia => pericia.id == id);
            pericia[level].splice(index, 1);
        }
    }
}


const ids = {
    linguas: new Set(["default"]),
    atributos: new Set([101, 102]),
    /**
    * @type {Set<number>}
    */
    pericias: new Set(),
    niveisPericias: new Set(["false"]),
}

/**
 * @param {Object.<string, object|number|string>} obj
 * @param {string} [value=""]
 * @returns {Object.<string, object|number|string>}
 */
function setDefaultStringRecursively(obj, value = "") {
    // iterating over the object using for..in
    for (const key in obj) {
        //checking if the current value is an object itself
        if (typeof obj[key] === 'object') {
            // if so then again calling the same function
            setDefaultStringRecursively(obj[key], value);
            continue;
        }
        if (typeof obj[key] !== "string") {
            continue;
        }
        obj[key] = value;
    }

    return obj;
}

const pools = {
    status: {
        idPool: ids.atributos,
        /**
         * @param {number} id 
         */
        add(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                languageObject.status[id] = {
                    label: "",
                    display: ""
                };
            }
            statusObj.push({
                id: id,
                emoji: ""
            });
        },
        /**
         * @param {number} id 
         */
        delete(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                delete languageObject.status[id];
            }
            for (let i = 0; i < statusObj.length; i++) {
                const status = statusObj[i];
                if (status.id == id) {
                    statusObj.splice(i, 1);
                    return;
                }
            }
        }
    },
    attribute: {
        idPool: ids.atributos,
        /**
         * @param {number} id 
         */
        add(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                languageObject.ficha[id] = "";
            }
            atributos.push({
                id: id,
                emoji: "",
                value: [{
                    dice: ""
                }]
            });
        },
        /**
         * @param {number} id 
         */
        delete(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                delete languageObject.ficha[id];
            }
            for (let i = 0; i < atributos.length; i++) {
                const atributo = atributos[i];
                if (atributo.id == id) {
                    atributos.splice(i, 1);
                    return;
                }
            }
        }
    },
    expertise: {
        idPool: ids.pericias,
        /**
         * @param {number} id 
         */
        add(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                languageObject.pericias[id] = "";
            }
            const objToPush = {
                id: id,
                emoji: ""
            };
            for (const nivel of niveisPericias) {
                objToPush[nivel.id] = [{
                    dice: ""
                }];
            }
            pericias.push(objToPush);
        },
        /**
         * @param {number} id 
         */
        delete(id) {
            console.log(id);
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                delete languageObject.pericias[id];
            }
            for (let i = 0; i < pericias.length; i++) {
                const pericia = pericias[i];
                if (pericia.id == id) {
                    pericias.splice(i, 1);
                    return;
                }
            }
        }
    },
    expertise_level: {
        idPool: ids.niveisPericias,
        /**
         * @param {string} id 
         */
        add(id) {
            if (this.idPool.has(id)) {
                return;
            }
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                languageObject.cmds.editar_pericias.niveis[id] = {
                    label: "",
                    display: ""
                };
            }
            for (const pericia of pericias) {
                pericia[id] = [{
                    dice: ""
                }];
            }
            niveisPericias.push({
                id: id,
                emoji: ""
            });

            const conditionsParents = document.getElementsByClassName("expertise-conditions-parent");
            for (const element of conditionsParents) {
                /**
                 * @type {HTMLElement}
                 */
                const template = templates.condition_group_expertise.cloneNode(true);
                
                element.appendChild(template);
                const idElement = template.querySelector("[data-id]");
                
                if (!idElement) {
                    continue;
                }

                idElement.dataset.id = id;
                idElement.innerText = idElement.innerText.replace("{}", id)
            }
        },
        /**
         * @param {string} id 
         * @param {string} newId 
         */
        edit(id, newId) {
            if (this.idPool.has(newId)) {
                return;
            }
            const nivel = niveisPericias.find(level => {
                if (id === level.id) {
                    level.id = newId;
                    return true;
                }
                return false;
            });

            if (!nivel) {
                return this.add(newId);
            }

            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default.cmds.editar_pericias.niveis}
                 */
                const levelsObject = i18n[lang].cmds.editar_pericias.niveis;
                levelsObject[newId] = levelsObject[id];
                delete levelsObject[id];
            }

            const conditionsParents = document.getElementsByClassName("expertise-conditions-parent");
            for (const element of conditionsParents) {
                const idElement = element.querySelector(`[data-id=${id}]`);
                
                if (!idElement) {
                    continue;
                }

                idElement.innerText = idElement.innerText.replace(id, newId);
                idElement.dataset.id = newId;
            }
        },
        /**
         * @param {number} id 
         */
        delete(id) {
            for (const lang in i18n) {
                /**
                 * @type {typeof i18n.default}
                 */
                const languageObject = i18n[lang];
                delete languageObject.cmds.editar_pericias.niveis[id];

            }
            for (let i = 0; i < niveisPericias.length; i++) {
                const nivel = niveisPericias[i];
                if (nivel.id == id) {
                    niveisPericias.splice(i, 1);
                    break;
                }
            }
            const conditionsParents = document.getElementsByClassName("expertise-conditions-parent");
            for (const element of conditionsParents) {
                for (const child of element.children) {
                    const idElement = child.querySelector(`[data-id=${id}]`);
                    
                    if (!idElement) {
                        continue;
                    }
    
                    child.remove();
                    break;
                }
            }
        }
    },
    language: {
        idPool: ids.linguas,
        /**
         * @param {string} id 
         */
        add(id) {
            i18n[id] = JSON.parse(JSON.stringify(i18n.default));
            setDefaultStringRecursively(i18n[id]);
        },
        /**
         * @param {string} id 
         * @param {string} newId 
         */
        edit(id, newId) {
            i18n[newId] = i18n[id];
            delete i18n[id];
        },
        /**
         * @param {number} id 
         */
        delete(id) {
            delete i18n[id];
        }
    },
}

const i18n = {
    default: {
        hp: {
            current: {
                label: "",
                id: 101
            },
            max: {
                label: "",
                id: 102
            },
            display: ""
        },
        status: {
            
        },
        ficha: {
            
        },
        pericias: {

        },
        cmds: {
            config: {
                label: "",
                emoji: "",
                description: ""
            },
            di: {
                title: "",
                img: "",
                placeholder: {
                    atributos: "",
                    pericias: ""
                },
                footer: ""
            },
            editar_pericias: {
                niveis: {
                    false: ""
                }
            }
        }
    }
}

const niveisPericias = [{
    id: "false",
    emoji: ""
}]

/**
 * @type {{
 *   id: number,
 *   emoji: string
 * }[]}
 */
const statusObj = []

/**
 * @typedef {{
 *  id: number,
 *  emoji: string
 *  value: {
 *   conditions: {
 *    type: "gt"|"lt"|"ge"|"le"|"ne"|"eq",
 *    left: string,
 *    right: string
 *  }[] | undefined,
 *  dice: string
 * }[]
 * }[]} Atributos
 */

/**
 * @type {Atributos}
 */
const atributos = []

/**
 * @typedef {{
 *  id: number,
 *  emoji: string
 *  [level: string]: {
 *   conditions: {
 *    type: "gt"|"lt"|"ge"|"le"|"ne"|"eq",
 *    left: string,
 *    right: string
 *  }[] | undefined,
 *  dice: string
 * }[]
 * }[]} Pericias
 */

/**
 * @type {Pericias}
 */
const pericias = []

const finalObject = {
    i18n: i18n,
    niveis_pericias: niveisPericias,
    status: statusObj,
    atributos: atributos,
    pericias: pericias,
}


const templatesArray = document.getElementsByClassName("template"); //é o brasino, jogo da galera.
/**
 * @type {{
 * status: HTMLElement
 * attribute: HTMLElement
 * condition_attribute: HTMLElement
 * expertise: HTMLElement
 * condition_group_expertise: HTMLElement
 * condition_expertise: HTMLElement
 * expertise_level: HTMLElement
 * language: HTMLElement
 * }}
 */
const templates = {};
for (let i = templatesArray.length - 1; i >= 0; i--) {
    const template = templatesArray[i];
    templates[template.dataset.templateType] = template;
    template.classList.remove("d-none", "template");
    template.remove();
}

delete templatesArray;