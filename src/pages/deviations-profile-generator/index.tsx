import React, { useState } from 'react';
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import { createAPI, type API, type ObjectGroup, type SceneData } from "@novorender/data-js-api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import("./index.css");

const JWT_KEY = "LOGIN_JWT";

export default function DeviationsProfileGenerator() {

    const [loginDetails, setLoginDetails] = useState<{ username: string; password: string; }>({ username: "", password: "" });
    const [sceneDetails, setSceneDetails] = useState<{ dataServerUrl: string; sceneId: string; }>({ dataServerUrl: "https://data.novorender.com/api", sceneId: "" });
    const [pointsVsTriangles, setPointsVsTriangles] = useState<{ name: string; groups: ObjectGroup[]; }>({ name: "", groups: [] });
    const [pointsVsPoints, setPointsVsPoints] = useState<{ name: string; fromGroups: ObjectGroup[]; toGroups: ObjectGroup[]; }>({ name: "", fromGroups: [], toGroups: [] });
    const [token, setToken] = useState<string>();
    const [dataApi, setDataApi] = useState<API>();
    const [sceneData, setSceneData] = useState<SceneData>();
    const [pointsVsTrianglesData, setPointsVsTrianglesData] = useState<{ pointToTriangle: { groups: Array<{ name: string; groupIds: Array<string>; objectIds: Array<number>; }>; }; }>({ pointToTriangle: { groups: [] } });
    const [pointsVsPointsData, setPointsVsPointsData] = useState<{
        pointToPoint: {
            groups: Array<{ name: string; to: { groupIds: Array<string>; objectIds: Array<number>; }; from: { groupIds: Array<string>; objectIds: Array<number>; }; }>;
        };
    }>({ pointToPoint: { groups: [] } });
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    React.useEffect(() => {
        setToken(localStorage.getItem(JWT_KEY) as string);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, stateKey: string) => {
        const name = event.target.name;
        const value = event.target.value;
        switch (stateKey) {
            case "login":
                setLoginDetails(values => ({ ...values, [name]: value }));
                break;
            case "sceneDetails":
                setSceneDetails(values => ({ ...values, [name]: value }));
                break;
            case "pointsVsTriangles":
                setPointsVsTriangles(values => ({ ...values, [name]: value }));
                break;
            case "pointsVsPoints":
                setPointsVsPoints(values => ({ ...values, [name]: value }));
                break;
        }

    };

    const handlePointsVsTrianglesSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await loadIds();

        const groupIds: string[] = [];
        const objectIds: number[] = [];
        for (const g of pointsVsTriangles.groups) {
            groupIds.push(g.id);
            if (g.ids) {
                for (const o of g.ids) {
                    objectIds.push(o);
                }
            }
        }

        console.log(JSON.stringify({ groupIds, objectIds }));
        setPointsVsTrianglesData(values => ({ pointToTriangle: { groups: [...values.pointToTriangle.groups, { name: pointsVsTriangles.name, groupIds, objectIds }] } }));
        setPointsVsTriangles({ name: "", groups: [] });

    };


    const handlePointsVsPointsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await loadIds();

        const fromGroupIds: string[] = [];
        const fromObjectIds: number[] = [];
        const toGroupIds: string[] = [];
        const toObjectIds: number[] = [];
        for (const g of pointsVsPoints.fromGroups) {
            fromGroupIds.push(g.id);
            if (g.ids) {
                for (const o of g.ids) {
                    fromObjectIds.push(o);
                }
            }
        }
        for (const g of pointsVsPoints.toGroups) {
            toGroupIds.push(g.id);
            if (g.ids) {
                for (const o of g.ids) {
                    toObjectIds.push(o);
                }
            }
        }

        setPointsVsPointsData(values => ({
            pointToPoint: {
                groups: [...values.pointToPoint.groups,
                { name: pointsVsPoints.name, to: { groupIds: toGroupIds, objectIds: toObjectIds }, from: { groupIds: fromGroupIds, objectIds: fromObjectIds } }]
            }
        }));
        setPointsVsPoints({ name: "", fromGroups: [], toGroups: [] });
        // setSceneData(values => ({ ...values, objectGroups: values?.objectGroups.map(g => { g["picked"] = false; return g; }) } as SceneData));
    };

    async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const res: { token: string; } = await fetch("https://data.novorender.com/api" + "/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${loginDetails.username}&password=${loginDetails.password}`,
        })
            .then((res) => res.json())
            .catch(() => {
                return { token: "" };
            });

        if (res?.token) {
            localStorage.setItem(JWT_KEY, res.token);
            setToken(res.token);
        } else {
            alert("Login Failed");
        }
    }

    async function loadScene(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const dataApi = createAPI({
            serviceUrl: sceneDetails.dataServerUrl,
            authHeader: async () => ({
                header: "Authorization",
                value: `Bearer ${token}`,
            }),
        });

        setDataApi(dataApi);
        const sceneData = await dataApi.loadScene(sceneDetails.sceneId);
        setSceneData(sceneData as SceneData);
        setIsDetailsOpen(false);
    }


    async function loadIds(): Promise<void> {
        const local_scene_data = Object.assign({}, sceneData);

        const groupIdRequests: Promise<void>[] | undefined = local_scene_data?.objectGroups.map(async (group) => {
            if (!group.ids) {
                group.ids = await dataApi?.getGroupIds(sceneDetails.sceneId, group.id).catch(() => {
                    console.warn("failed to load ids for group - ", group.id);
                    return [];
                });
            }
        });

        if (groupIdRequests) {
            await Promise.all(groupIdRequests);
        }

        setSceneData(local_scene_data);
    }

    function selectGrp(target: string, group: ObjectGroup, groups: ObjectGroup[]) {

        const _groups = [...groups];

        const isPicked = _groups.findIndex(({ id }) => id === group.id);
        if (isPicked !== -1) {
            _groups.splice(isPicked, 1);
        } else {
            _groups.push(group);
        }

        switch (target) {
            case 'pointsVsTriangles':
                setPointsVsTriangles({ name: pointsVsTriangles.name, groups: _groups });
                break;
            case 'pointsVsPointsFrom':
                setPointsVsPoints({ name: pointsVsPoints.name, fromGroups: _groups, toGroups: pointsVsPoints.toGroups });
                break;
            case 'pointsVsPointsTo':
                setPointsVsPoints({ name: pointsVsPoints.name, toGroups: _groups, fromGroups: pointsVsPoints.fromGroups });
                break;
        }

    }

    function logout() {
        localStorage.removeItem(JWT_KEY);
        setToken(null);
    }

    return (
        <Layout>
            <div className="deviations-root">
                {
                    !token
                        ? <div style={{ background: "transparent" }} className="hero shadow--lw">
                            <div className="container">
                                <h1 className="hero__title">Login</h1>
                                <div>
                                    <form onSubmit={handleLoginSubmit}>
                                        <label>Username:</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={loginDetails.username}
                                            onChange={(e) => { handleInputChange(e, 'login'); }}
                                        />
                                        <br />
                                        <label>Password:</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={loginDetails.password}
                                            onChange={(e) => { handleInputChange(e, 'login'); }}
                                        />
                                        <br />
                                        <input type="submit" />
                                    </form>
                                </div>
                            </div>
                        </div>
                        : <div className='main-container'>

                            <button onClick={logout} className='button-logout button button--sm button--outline button--warning'>Logout &nbsp; <FontAwesomeIcon icon={faArrowRightFromBracket} /></button>

                            <div className='scene-details-container'>
                                <details open={isDetailsOpen}>
                                    <summary>Scene Details</summary>
                                    <form onSubmit={loadScene}>
                                        <label>Data Server URL:</label>
                                        <input
                                            type="text"
                                            name="dataServerUrl"
                                            value={sceneDetails.dataServerUrl}
                                            onChange={(e) => { handleInputChange(e, 'sceneDetails'); }}
                                        />
                                        <label>Scene ID:</label>
                                        <input
                                            type="text"
                                            name="sceneId"
                                            value={sceneDetails.sceneId}
                                            onChange={(e) => { handleInputChange(e, 'sceneDetails'); }}
                                        />
                                        <button type="submit">Load Scene</button>
                                    </form>
                                </details>
                            </div>

                            {!sceneData
                                ? <p>Load Scene First</p>
                                : <div className='deviations-container'>
                                    <div>
                                        <div className="dev-header">
                                            <h3>{sceneData.title}</h3>
                                        </div>
                                        <hr />
                                        <div className='d-form pt-form'>
                                            <h4>Point vs Triangles</h4>
                                            <form onSubmit={handlePointsVsTrianglesSubmit}>
                                                <label>Name:</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={pointsVsTriangles.name || ""}
                                                    onChange={(e) => { handleInputChange(e, 'pointsVsTriangles'); }}
                                                />
                                                <br />
                                                <label>Group IDs:</label>
                                                <div style={{ width: "100%" }} className="dropdown dropdown--hoverable">
                                                    <ul className="dropdown__menu" style={{ width: "100%" }}>
                                                        {sceneData.objectGroups.filter(g => g.id).map(g =>
                                                            <li onClick={() => selectGrp('pointsVsTriangles', g, pointsVsTriangles.groups)} style={{ cursor: "pointer" }} className="dropdown__link" key={g.name}>
                                                                {(pointsVsTriangles?.groups?.findIndex(v => v.id === g.id) !== -1) && <FontAwesomeIcon icon={faCheck} />}
                                                                {" " + g.name}</li>
                                                        )}
                                                    </ul>
                                                    <textarea name="groupIds" value={pointsVsTriangles.groups.map(g => g.id).join() || ""} readOnly />
                                                </div>
                                                <br />
                                                <input type="submit" value="Generate" />
                                            </form>
                                        </div>
                                        <hr />
                                        <div className='d-form pp-form'>
                                            <h4>Points vs points</h4>
                                            <form onSubmit={handlePointsVsPointsSubmit}>
                                                <label>Name:</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={pointsVsPoints.name || ""}
                                                    onChange={(e) => { handleInputChange(e, 'pointsVsPoints'); }}
                                                />
                                                <br />
                                                <label>From Group IDs:</label>
                                                <div style={{ width: "100%" }} className="dropdown dropdown--hoverable">
                                                    <ul className="dropdown__menu" style={{ width: "100%" }}>
                                                        {sceneData.objectGroups.filter(g => g.id).map(g =>
                                                            <li onClick={() => selectGrp("pointsVsPointsFrom", g, pointsVsPoints.fromGroups)} style={{ cursor: "pointer" }} className="dropdown__link" key={g.name}>
                                                                {pointsVsPoints?.fromGroups?.findIndex(v => v.id === g.id) !== -1 && <FontAwesomeIcon icon={faCheck} />}
                                                                {" " + g.name}</li>
                                                        )}
                                                    </ul>
                                                    <textarea name="fromGroupIds" value={pointsVsPoints.fromGroups.map(g => g.id).join() || ""} readOnly />
                                                </div>

                                                <br />
                                                <label>To Group IDs:</label>
                                                <div style={{ width: "100%" }} className="dropdown dropdown--hoverable">
                                                    <ul className="dropdown__menu" style={{ width: "100%" }}>
                                                        {sceneData.objectGroups.filter(g => g.id).map(g =>
                                                            <li onClick={() => selectGrp("pointsVsPointsTo", g, pointsVsPoints.toGroups)} style={{ cursor: "pointer" }} className="dropdown__link" key={g.name}>
                                                                {pointsVsPoints?.toGroups?.findIndex(v => v.id === g.id) !== -1 && <FontAwesomeIcon icon={faCheck} />}
                                                                {" " + g.name}</li>
                                                        )}
                                                    </ul>
                                                    <textarea name="toGroupIds" value={pointsVsPoints.toGroups.map(g => g.id).join() || ""} readOnly />
                                                </div>
                                                <br />
                                                <input type="submit" value="Generate" />
                                            </form>
                                        </div>
                                    </div>

                                    <div className="codeblock" style={{ maxHeight: 800, overflow: "scroll" }}>
                                        <CodeBlock language="json">
                                            {JSON.stringify({
                                                "rebuildRequired": true,
                                                ...pointsVsTrianglesData,
                                                ...pointsVsPointsData
                                            }, null, 4)}
                                        </CodeBlock>
                                    </div>
                                </div>
                            }
                        </div>
                }
            </div>
        </Layout>

    );
}
