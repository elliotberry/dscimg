import { fdir } from "fdir"

/**
 * Returns an array of file paths for a glob based on program opts.
 * args: {string} globPattern - The glob pattern to match against file paths.
 */
const useFdir = async (pattern, maxDepth = -1, directories = false, glob = true) => {
    try {
        let funktion = new fdir().withFullPaths()
        if (maxDepth !== -1) {
            funktion = funktion.withMaxDepth(maxDepth)
        }
        if (directories) {
            funktion = funktion.withDirs()
        }
        return glob ? await funktion.glob(pattern).crawl(pattern).withPromise() : await funktion.crawl(pattern).withPromise();
    } catch (error) {
        throw new Error(`error using fdir: ${error.toString()}`)
    }
}

export default useFdir
