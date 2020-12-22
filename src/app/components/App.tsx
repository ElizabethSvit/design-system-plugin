import * as React from 'react';
import '../styles/ui.css';
import {Config, ConfigForm} from './configForm';
import {useState} from 'react';

const NETWORK_ERROR = "Network error";

function httpRequest(config: Config, requestType, url, content?) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(requestType, url);
        xhr.setRequestHeader('Authorization', `token ${config.token}`);

        xhr.onload = function() {
            resolve(this.response);
            if (xhr.status != 200) {
                closePlugin();
            }
        };

        xhr.onerror = function() {
            reject(new Error(NETWORK_ERROR));
        };

        content ? xhr.send(content) : xhr.send();
    });
}

function closePlugin() {
    window.parent.postMessage({pluginMessage: { type: 'done'} }, '*');
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
    let [config, setConfig] = useState(createEmptyConfig());
    let [cachedConfig, setCachedConfig] = useState(createEmptyConfig());

    const onSubmit = (inputConfig: Config) => {
        setConfig(inputConfig);
    };

    React.useEffect(() => {
        parent.postMessage({ pluginMessage: { type: 'getConfig' } }, '*');
        window.onmessage = async (event) => {
            if (event.data.pluginMessage.type === 'networkRequest') {
                // Get last sha of file in which to commit
                httpRequest(config, 'GET', `${config.repoPath}/contents/styles.json?ref=${config.headBranch}`)
                    // Commit changes to head branch
                    .then((response: string) => {
                        const sha = JSON.parse(response).sha;
                        return httpRequest(config, 'PUT', `${config.repoPath}/contents/styles.json`,
                            [JSON.stringify({
                                message: "applying Figma styles update",
                                content: window.btoa(event.data.pluginMessage.content),
                                branch: "styles",
                                committer: {
                                    name: config.committerName,
                                    email: config.committerEmail
                                },
                                sha
                            })])
                    })
                    // Make a pull request from head to base branch
                    .then(() => {
                        return httpRequest(config, 'POST', `${config.repoPath}/pulls`,
                            [JSON.stringify({
                                owner: config.committerName,
                                repo: "design-system",
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

    return (
        <div>
            <h2>Синхронизировать дизайн с кодом?</h2>
            <ConfigForm onSubmit={onSubmit} cachedConfig={cachedConfig} />
        </div>
    );
};

export default App;
