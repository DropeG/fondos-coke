// src/FileUploader.js
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import './FileUploader.css';

function FileUploader() {
    const [sfFile, setSfFile] = useState(null);
    const [odFile, setOdFile] = useState(null);

    const onDropSf = useCallback((acceptedFiles) => {
        setSfFile(acceptedFiles[0]);
        console.log('SF file dropped:', acceptedFiles[0]);
    }, []);

    const onDropOd = useCallback((acceptedFiles) => {
        setOdFile(acceptedFiles[0]);
        console.log('OD file dropped:', acceptedFiles[0]);
    }, []);

    const { getRootProps: getRootPropsSf, getInputProps: getInputPropsSf, isDragActive: isDragActiveSf } = useDropzone({ onDrop: onDropSf });
    const { getRootProps: getRootPropsOd, getInputProps: getInputPropsOd, isDragActive: isDragActiveOd } = useDropzone({ onDrop: onDropOd });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Verificación para asegurarse de que ambos archivos están seleccionados
        if (!sfFile || !odFile) {
            console.error('Both files must be selected before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('sfFile', sfFile);
        formData.append('odFile', odFile);

        console.log('Submitting files:', sfFile, odFile);

    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className='container'>
                    <h2 className='sf'>Servicios Financieros:</h2>
                    <div {...getRootPropsSf()} className='dropzone'>
                        <input {...getInputPropsSf()} />
                        <div className='inner'>
                            <FontAwesomeIcon icon={faUpload} size="3x" />
                            <p className='text'>
                                {isDragActiveSf ? 'Drop the files here ...' : 'Upload file'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='container'>
                    <h2 className='sf'>Operaciones Diarias:</h2>
                    <div {...getRootPropsOd()} className='dropzone'>
                        <input {...getInputPropsOd()} />
                        <div className='inner'>
                            <FontAwesomeIcon icon={faUpload} size="3x" />
                            <p className='text'>
                                {isDragActiveOd ? 'Drop the files here ...' : 'Upload file'}
                            </p>
                        </div>
                    </div>
                </div>

                <button className='submit' type='submit'>Submit</button>
            </form>
        </div>
    );
}

export default FileUploader;