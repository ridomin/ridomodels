type modelIndex = {
    models: Array<modelInfo>,
    lastUpdate: string,
    repoName: string
}

type modelInfo = {
    dtmi: string,
    path: string,
    owner: string,
    depends: Array<string>
}

