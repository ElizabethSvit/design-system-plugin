import * as React from 'react';
import '../styles/ui.css';
import {Config, ConfigForm} from './configForm';
import {useState} from 'react';

const NETWORK_ERROR = "Network error";
const LAST_SUCCESSFUL_STATUS = 299;

function httpRequest(config: Config, requestType, url, setErrorLog, setLoading, content?) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(requestType, url);
        xhr.setRequestHeader('Authorization', `token ${config.token}`);
        xhr.responseType = 'text';

        xhr.onload = function() {
            if (xhr.status > LAST_SUCCESSFUL_STATUS) {
                setLoading(false);
                setErrorLog(`Ошибка в запросе ${requestType} ${url}: ${xhr.status} ${JSON.parse(xhr.responseText).message}`);
                reject();
            } else {
                resolve(this.response);
            }
        };

        xhr.onerror = function() {
            setLoading(false);
            setErrorLog(`Ошибка в запросе ${requestType} ${url}: ${NETWORK_ERROR}`);
            reject(new Error(NETWORK_ERROR));
        };

        content ? xhr.send(content) : xhr.send();
    });
}

function createEmptyConfig() {
    return {
        repoPath: '',
        token: '',
        committerName: '',
        committerEmail: '',
        headBranch: '',
        baseBranch: ''
    };
}

const App = ({}) => {
    let [cachedConfig, setCachedConfig] = useState(createEmptyConfig());
    const [isLoading, setLoading] = useState(false);
    const [errorLog, setErrorLog] = useState('');
    const [successLog, setSuccessLog] = useState('');

    React.useEffect(() => {
        parent.postMessage({ pluginMessage: { type: 'getConfig' } }, '*');
        window.onmessage = async (event) => {
            if (event.data.pluginMessage.type === 'networkRequest') {
                setLoading(true);
                const config = event.data.pluginMessage.config;

                // Get last sha of file in which to commit
                httpRequest(
                    config,
                    'GET',
                    `${config.repoPath}/contents/styles.json?ref=${config.headBranch}`,
                    setErrorLog,
                    setLoading
                ).then((response: string) => { // Commit changes to head branch
                        const sha = JSON.parse(response).sha;
                        return httpRequest(
                            config,
                            'PUT',
                            `${config.repoPath}/contents/styles.json`,
                            setErrorLog,
                            setLoading,
                            [JSON.stringify({
                                message: "applying Figma styles update",
                                content: window.btoa(event.data.pluginMessage.content),
                                branch: config.headBranch,
                                committer: {
                                    name: config.committerName,
                                    email: config.committerEmail
                                },
                                sha
                            })])
                    }).then(() => { // Make a pull request from head to base branch
                        const repoNameParsed = config.repoPath.split('/');
                        return httpRequest(
                            config,
                            'POST',
                            `${config.repoPath}/pulls`,
                            setErrorLog,
                            setLoading,
                            [JSON.stringify({
                                owner: config.committerName,
                                repo: repoNameParsed[repoNameParsed.length - 1],
                                head: config.headBranch,
                                base: config.baseBranch,
                                title: "Update styles",
                            })])
                    })
                    .then(closePlugin);
            }

            if (event.data.pluginMessage.type === 'githubConfig') {
                setCachedConfig(event.data.pluginMessage.content);
            }
        }
    }, []);

    function closePlugin() {
        setLoading(false);
        setSuccessLog('Успешно отправлено!');
        setTimeout(
            () => window.parent.postMessage({pluginMessage: { type: 'done'} }, '*'),
            1000
        );
    }

    return (
        <div>
            <h2>Синхронизировать дизайн с кодом?</h2>
            <ConfigForm cachedConfig={cachedConfig}/>
            {isLoading ? <p>Loading...</p> : errorLog.length > 0 ?
                <p className="error-message">{errorLog}</p> : <p className="success-message">{successLog}</p>}
        </div>
    );
};

export default App;
