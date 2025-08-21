let saveLink: string | null = null;

export const useFileLink = (json: string, saveName: string) => {

	if (saveLink) URL.revokeObjectURL(saveLink);

	const file = new Blob([json], { type: "text/json;charset=utf-8" });

	const a = document.createElement('a');
	//targ.type = 'text/json';
	a.download = a.title = saveName + '.json';

	saveLink = URL.createObjectURL(file);
	a.href = saveLink;
	a.click();
	a.remove();

}

/**
 * 
 * @param fileList Load json file as raw string.
 * @returns 
 */
export const loadJsonStr = (fileList: FileList) => {

	const file = fileList[0];
	if (!file) return;

	return new Promise<string>((res, rej) => {

		const reader = new FileReader();
		reader.onload = (e) => {

			try {
				res(e.target!.result as string);

			} catch (err: any) {
				console.error(err.message + '\n' + err.stack);
			}

		}
		reader.onerror = (evt) => rej(evt);
		reader.readAsText(file);

	});

}


/**
 * 
 * @param fileList Load json file and parse as type.
 * @returns 
 */
export const loadJsonFile = <T extends any>(fileList: FileList) => {

	const file = fileList[0];
	if (!file) return;

	return new Promise<T>((res, rej) => {

		const reader = new FileReader();
		reader.onload = (e) => {

			try {

				const data = JSON.parse(e.target!.result as string);
				res(data);

			} catch (err: any) {
				console.error(err.message + '\n' + err.stack);
			}

		}
		reader.onerror = (evt) => rej(evt);
		reader.readAsText(file);

	});

}
