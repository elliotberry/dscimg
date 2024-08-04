import { fdir } from "fdir"

/**
 * Returns an array of file paths for a glob based on program opts.
 * args: {string} globPattern - The glob pattern to match against file paths.
 */
const useFdir = async (pattern, maxDepth = -1, directories = false, glob = false) => {
    try {
        let funktion = new fdir()
        if (maxDepth !== -1) {
            funktion = funktion.withFullPaths().withMaxDepth(maxDepth)
        }
        if (directories) {
            funktion = funktion.withFullPaths().withDirs()
        }
        return glob ?
                await funktion.glob(pattern).crawl().withPromise()
            :   await funktion.crawl(pattern).withPromise()
    } catch (error) {
        throw new Error(`error using fdir: ${error.toString()}`)
    }
}

export default useFdir
