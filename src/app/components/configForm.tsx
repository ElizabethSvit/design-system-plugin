import * as React from 'react';
import {useInput} from '../hooks/inputHook';

export type Config = {
    repoPath: string,
    token: string,
    committerName: string,
    committerEmail: string,
    headBranch: string,
    baseBranch: string
};

type Props = {
    onSubmit: (config: Config) => void;
    cachedConfig: Config;
}

export function ConfigForm(props: Props) {
    const {value: repoPath, setValue: setRepoPath, bind: bindRepoPath} = useInput(props.cachedConfig.repoPath);
    const {value: token, setValue: setToken, bind: bindToken} = useInput('');
    const {value: committerName, setValue: setCommitterName, bind: bindCommitterName} = useInput('');
    const {value: committerEmail, setValue: setCommitterEmail, bind: bindCommitterEmail} = useInput('');
    const {value: headBranch, setValue: setHeadBranch, bind: bindHeadBranch} = useInput('');
    const {value: baseBranch, setValue: setBaseBranch, bind: bindBaseBranch} = useInput('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const config = {
            repoPath,
            token,
            committerName,
            committerEmail,
            headBranch,
            baseBranch,
        };
        props.onSubmit(config);
        parent.postMessage({ pluginMessage: { type: 'send', config } }, '*');
    };

    React.useEffect(() => {
        setRepoPath(props.cachedConfig.repoPath);
        setToken(props.cachedConfig.token);
        setCommitterName(props.cachedConfig.committerName);
        setCommitterEmail(props.cachedConfig.committerEmail);
        setHeadBranch(props.cachedConfig.headBranch);
        setBaseBranch(props.cachedConfig.baseBranch);
    }, [props.cachedConfig]);

    return (
        <form onSubmit={handleSubmit}>
            <p className="form-label">
                Repo path:
                <input type="text" {...bindRepoPath} />
            </p>
            <p className="form-label">
                Github token:
                <input type="text" {...bindToken} />
            </p>
            <p className="form-label">
                Committer name:
                <input type="text" {...bindCommitterName} />
            </p>
            <p className="form-label">
                Committer email:
                <input type="text" {...bindCommitterEmail} />
            </p>
            <p className="form-label">
                Head branch:
                <input type="text" {...bindHeadBranch} />
            </p>
            <p className="form-label">
                Base branch:
                <input type="text" {...bindBaseBranch} />
            </p>
            <button type="submit" value="Submit">Отправить</button>
        </form>
    );
}
