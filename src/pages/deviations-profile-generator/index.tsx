import React, { useState } from 'react';
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import { createAPI, type API, type ObjectGroup, type SceneData } from "@novorender/data-js-api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import("./index.css");

interface CustomObjectGroup extends ObjectGroup {
    picked?: boolean;
}

const JWT_KEY = "LOGIN_JWT";

export default function DeviationsProfileGenerator() {

    const [loginDetails, setLoginDetails] = useState<{ username: string; password: string; }>({ username: "", password: "" });
    const [sceneDetails, setSceneDetails] = useState<{ dataServerUrl: string; sceneId: string; }>({ dataServerUrl: "https://data.novorender.com/api", sceneId: "" });
    const [pointsVsTriangles, setPointsVsTriangles] = useState<{ name: string; groups: CustomObjectGroup[]; }>({ name: "", groups: [] });
    const [pointsVsPoints, setPointsVsPoints] = useState<{ name: string; fromGroupIds: string; toGroupIds: string; }>({ name: "", fromGroupIds: "", toGroupIds: "" });
    const [token, setToken] = useState<string>();
    const [dataApi, setDataApi] = useState<API>();
    const [sceneData, setSceneData] = useState<SceneData>();
    const [pointsVsTrianglesData, setPointsVsTrianglesData] = useState<{ pointToTriangle: { groups: Array<{ name: string; groupIds: Array<string>; objectIds: Array<number>; }>; }; }>({ pointToTriangle: { groups: [] } });
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
        setSceneData(values => ({ ...values, objectGroups: values?.objectGroups.map(g => { g["picked"] = false; return g; }) } as SceneData));

    };


    const handlePointsVsPointsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('inputs ', pointsVsTriangles);
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

        // const dataApiModule = await import("@novorender/data-js-api");

        const dataApi = createAPI({
            serviceUrl: sceneDetails.dataServerUrl,
            authHeader: async () => ({
                header: "Authorization",
                value: `Bearer ${token}`,
            }),
        });

        setDataApi(dataApi);

        const sceneData = await dataApi.loadScene(sceneDetails.sceneId);

        console.log('SceneData ', sceneData);
        // Destructure relevant properties into variables
        // const { url } = sceneData as SceneData;

        setSceneData(sceneData as SceneData);
        setIsDetailsOpen(false);
    }


    async function loadIds(): Promise<void> {



        // const grp_ids = pointsVsTriangles.groupIds.split(",").map(id => id.trim());
        // console.log("grp_idsgrp_ids ", grp_ids);
        // for (const id of grp_ids) {
        //   const ids = await dataApi?.getGroupIds(sceneDetails.sceneId, id).catch(() => {
        //     console.warn("failed to load ids for group - ", id);
        //     return [];
        //   });

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
        console.log("loca ", local_scene_data);
    }

    function selectGrp(group: CustomObjectGroup) {

        const groups = [...pointsVsTriangles.groups];

        const isPicked = groups.findIndex(({ id }) => id === group.id);
        if (isPicked !== -1) {
            groups.splice(isPicked, 1);
            group.picked = false;
        } else {
            groups.push(group);
            group.picked = true;
        }
        setPointsVsTriangles({ name: pointsVsTriangles.name, groups: groups });
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
                                        {/* <br /> */}
                                        <label>Scene ID:</label>
                                        <input
                                            type="text"
                                            name="sceneId"
                                            value={sceneDetails.sceneId}
                                            onChange={(e) => { handleInputChange(e, 'sceneDetails'); }}
                                        />
                                        {/* <br /> */}
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
                                            <p>Point vs triangles</p>
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
                                                    <ul className="dropdown__menu">
                                                        {sceneData.objectGroups.map(g =>
                                                            <li onClick={() => selectGrp(g)} style={{ cursor: "pointer" }} className="dropdown__link" key={g.name}>
                                                                {g["picked"] && <FontAwesomeIcon icon={faCheck} />}
                                                                {" " + g.name}</li>
                                                        )}
                                                    </ul>
                                                <textarea
                                                    name="groupIds"
                                                        value={pointsVsTriangles.groups.map(g => g.id).join() || ""}
                                                        // onChange={(e) => { handleInputChange(e, 'pointsVsTriangles'); }}
                                                        readOnly
                                                    />
                                                </div>
                                                <br />
                                                <input type="submit" />
                                            </form>
                                        </div>
                                        <hr />
                                        <div className='d-form pp-form'>
                                            <p>Points vs points</p>
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
                                                <textarea
                                                    name="fromGroupIds"
                                                    value={pointsVsPoints.fromGroupIds || ""}
                                                    onChange={(e) => { handleInputChange(e, 'pointsVsPoints'); }}
                                                />
                                                <br />
                                                <label>To Group IDs:</label>
                                                <textarea
                                                    name="toGroupIds"
                                                    value={pointsVsPoints.toGroupIds || ""}
                                                    onChange={(e) => { handleInputChange(e, 'pointsVsPoints'); }}
                                                />
                                                <br />
                                                <input type="submit" />
                                            </form>
                                        </div>
                                    </div>

                                    <div style={{ maxHeight: 800, overflow: "scroll" }}>
                                        <CodeBlock language="json">
                                            {JSON.stringify({
                                                "rebuildRequired": true,
                                                ...pointsVsTrianglesData
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
