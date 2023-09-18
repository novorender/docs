import React, { useState } from 'react';
import { type API, type ObjectGroup, type SceneData } from "@novorender/data-js-api";
import("./index.css");


const JWT_KEY = "LOGIN_JWT";

export default function DeviationsProfileGenerator() {

    const [loginDetails, setLoginDetails] = useState<{ username: string; password: string; }>({ username: "", password: "" });
    const [sceneDetails, setSceneDetails] = useState<{ dataServerUrl: string; sceneId: string; }>({ dataServerUrl: "https://data.novorender.com/api", sceneId: "" });
    const [pointsVsTriangles, setPointsVsTriangles] = useState<{ name: string; groupIds: string; }>({ name: "", groupIds: "" });
    const [pointsVsPoints, setPointsVsPoints] = useState<{ name: string; fromGroupIds: string; toGroupIds: string; }>({ name: "", fromGroupIds: "", toGroupIds: "" });
    const [token, setToken] = useState<string>();
    const [dataApi, setDataApi] = useState<API>();
    const [sceneData, setSceneData] = useState<SceneData>();
    const [pointsVsTrianglesData, setPointsVsTrianglesData] = useState<Array<{ name: string; groupIds: Array<string>; objectIds: Array<number>; }>>([]);


    React.useEffect(() => {

        setToken(localStorage.getItem(JWT_KEY) as string);

    }, []);

    const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setLoginDetails(values => ({ ...values, [name]: value }));
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setSceneDetails(values => ({ ...values, [name]: value }));
    };
    const handlePointsVsTrianglesChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setPointsVsTriangles(values => ({ ...values, [name]: value }));
    };

    const handlePointsVsTrianglesSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('inputs ', pointsVsTriangles);

        await loadIds();


        const grp_ids = pointsVsTriangles.groupIds.split(",").map(id => id.trim());

        const filtered_grps: ObjectGroup[] = [];

        // for (const id of grp_ids) {
        filtered_grps.push(sceneData?.objectGroups.find(g => g.name?.toLowerCase() === pointsVsTriangles.name.toLowerCase()) as ObjectGroup);
        // }

        console.log("filtered_grps ", filtered_grps);

        const groupIds: string[] = [];
        const objectIds: number[] = [];
        for (const id of grp_ids) {
            groupIds.push(id);
            for (const grp of filtered_grps) {
                if (grp.id === id) {
                    objectIds.push(...grp.ids as number[]);
                }
            }
        }

        // for (const g of filtered_grps) {
        //   // if (g.selected) {
        //   if (g.ids) {
        //     for (const o of g.ids) {
        //       objectIds.push(o);
        //     }
        //   }
        // }
        // }
        console.log(JSON.stringify({ groupIds, objectIds }));
        setPointsVsTrianglesData(values => [...values, { name: pointsVsTriangles.name, groupIds, objectIds }]);



    };
    const handlePointsVsPointsChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setPointsVsPoints(values => ({ ...values, [name]: value }));
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

        const dataApiModule = await import("@novorender/data-js-api");

        const dataApi = dataApiModule.createAPI({
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

    return (
        <>
            {
                !token ?
                    <div>
                        <p>Login</p>
                        <form onSubmit={handleLoginSubmit}>
                            <label>Username:
                                <input
                                    type="text"
                                    name="username"
                                    value={loginDetails.username}
                                    onChange={handleLoginChange}
                                />
                            </label>
                            <br />
                            <label>Password:
                                <input
                                    type="password"
                                    name="password"
                                    value={loginDetails.password}
                                    onChange={handleLoginChange}
                                />
                            </label>
                            <input type="submit" />
                        </form>
                    </div>
                    :
                    <div className='main-container'>
                        <div className='scene-details-container'>
                            <details>
                                <summary>Scene Details</summary>
                                <form onSubmit={loadScene}>
                                    <label>Data Server URL:
                                        <input
                                            type="text"
                                            name="dataServerUrl"
                                            value={sceneDetails.dataServerUrl}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <br />
                                    <label>Scene ID:
                                        <input
                                            type="text"
                                            name="sceneId"
                                            value={sceneDetails.sceneId}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <br />
                                    <button type="submit">Load Scene</button>
                                </form>
                            </details>
                        </div>

                        {!sceneData
                            ? <p>Load Scene First</p>
                            : <div className='deviations-container'>
                                <div>

                                    <h3>{sceneData.title}</h3>
                                    <hr />
                                    <div className='d-form pt-form'>
                                        <p>Point vs triangles</p>
                                        <form onSubmit={handlePointsVsTrianglesSubmit}>
                                            <label>Name:
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={pointsVsTriangles.name || ""}
                                                    onChange={handlePointsVsTrianglesChange}
                                                />
                                            </label>
                                            <br />
                                            <label>Group IDs:
                                                <textarea
                                                    name="groupIds"
                                                    value={pointsVsTriangles.groupIds || ""}
                                                    onChange={handlePointsVsTrianglesChange}
                                                />
                                            </label>
                                            <br />
                                            <input type="submit" />
                                        </form>
                                    </div>
                                    <hr />
                                    <div className='d-form pp-form'>
                                        <p>Points vs points</p>
                                        <form onSubmit={handlePointsVsPointsSubmit}>
                                            <label>Name:
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={pointsVsPoints.name || ""}
                                                    onChange={handlePointsVsPointsChange}
                                                />
                                            </label>
                                            <br />
                                            <label>From Group IDs:
                                                <textarea
                                                    name="fromGroupIds"
                                                    value={pointsVsPoints.fromGroupIds || ""}
                                                    onChange={handlePointsVsPointsChange}
                                                />
                                            </label>
                                            <br />
                                            <label>To Group IDs:
                                                <textarea
                                                    name="toGroupIds"
                                                    value={pointsVsPoints.toGroupIds || ""}
                                                    onChange={handlePointsVsPointsChange}
                                                />
                                            </label>
                                            <br />
                                            <input type="submit" />
                                        </form>
                                    </div>
                                </div>

                                <div> <pre style={{ maxHeight: 800, overflow: "scroll" }}>
                                    {JSON.stringify(pointsVsTrianglesData, null, 4)}
                                </pre> </div>
                            </div>
                        }
                    </div>


            }
        </>

    );
}
