import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import './FileUploader.css';

function FileUploader() {
    const [sfFile, setSfFile] = useState(null);
    const [odFile, setOdFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [userInput, setUserInput] = useState({});

    const onDropSf = useCallback((acceptedFiles) => {
        setSfFile(acceptedFiles[0]);
    }, []);

    const onDropOd = useCallback((acceptedFiles) => {
        setOdFile(acceptedFiles[0]);
    }, []);

    const { getRootProps: getRootPropsSf, getInputProps: getInputPropsSf, isDragActive: isDragActiveSf } = useDropzone({ onDrop: onDropSf });
    const { getRootProps: getRootPropsOd, getInputProps: getInputPropsOd, isDragActive: isDragActiveOd } = useDropzone({ onDrop: onDropOd });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sfFile || !odFile) {
            console.error('Both files must be selected before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('sfFile', sfFile);
        formData.append('odFile', odFile);

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST', 
                body: formData,
            });

            if (response.ok){
                const result = await response.json();
                if (result.prompts) {
                    setPrompts(result.prompts);
                } else {
                    setUploadResult(JSON.stringify(result, null, 2));
                }
            } else {
                const errorText = await response.text();
                console.error("Error uploading files:", errorText);
            }
        } catch (error) {
            console.error("Error uploading files", error);
        }
    };

    const handleUserInputSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('sfFile', sfFile);
        formData.append('odFile', odFile);

        for (const key in userInput) {
            formData.append(`userInput[${key}]`, userInput[key]);
        }

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setUploadResult(JSON.stringify(result, null, 2));
            } else {
                const errorText = await response.text();
                console.error("Error uploading files:", errorText);
            }
        } catch (error) {
            console.error("Error uploading files", error);
        }
        
    };
    
    const handleUserInputChange = async (e) => {
        const { name, value } = e.target;
        setUserInput({ ...userInput, [name]: value });
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className='container'>
                    <h2 className='sf'>Servicios Financieros:</h2>
                    <div {...getRootPropsSf()} className='dropzone'>
                        <input {...getInputPropsSf()} />
                        <div className='inner'>
                            {!sfFile && (
                                <>
                                    <FontAwesomeIcon icon={faUpload} className='upload-icon'/>
                                    <p className='text'>
                                        {isDragActiveSf ? 'Drop the files here ...' : 'Upload file'}
                                    </p>
                                </>
                            )}
                            {sfFile && <p className='file-name'>{sfFile.name}</p>}
                            {sfFile && <FontAwesomeIcon icon={faCheckCircle} size='sm' className='check-icon' />}
                        </div>
                    </div>
                </div>

                <div className='container'>
                    <h2 className='sf'>Operaciones Diarias:</h2>
                    <div {...getRootPropsOd()} className='dropzone'>
                        <input {...getInputPropsOd()} />
                        <div className='inner'>
                            {!odFile && (
                                <>
                                    <FontAwesomeIcon icon={faUpload} className='upload-icon'/>
                                    <p className='text'>
                                        {isDragActiveOd ? 'Drop the files here ...' : 'Upload file'}
                                    </p>
                                </>
                            )}
                            {odFile && <p className='file-name'>{odFile.name}</p>}
                            {odFile && <FontAwesomeIcon icon={faCheckCircle} size='sm' className='check-icon' />}
                        </div>
                    </div>
                </div>

                <button className='submit' type='submit'>Submit</button>
            </form>
            {prompts.length > 0 && (
                <form className = 'prompt-form' onSubmit={handleUserInputSubmit}>
                    <h3 className='prompt-title'>Tipo de Venta:</h3>
                    {prompts.map((prompt, index) => (
                        <div key={index} className='prompt-container'>
                            <label className='prompt-label'>{prompt}:</label>
                            <input className='prompt-input' type="text" name={prompt} onChange={handleUserInputChange} />
                        </div>
                    ))}
                    <button className='submit' style={{marginTop: '20px'}} type="submit">Submit</button>
                </form>
            )}
            {uploadResult && <div className="upload-result"><pre>{uploadResult}</pre></div>}
        </div>
    );
}

export default FileUploader;
