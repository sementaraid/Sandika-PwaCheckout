import { GraphQLClient } from 'graphql-request';
import { IS_DEMO } from '@app/helper/demo';
import { mockRequest } from '@app/mock/server';

const GQLClient = new GraphQLClient(`http://localhost:5000/graphql`, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
});

const GQLClientRequest = async (query, variable = {}) => {
  /**
   * DEMO MODE: answer from the in-memory mock instead of the backend
   */
  if (IS_DEMO) {
    return mockRequest(query, variable);
  }

  try {
    const response = await GQLClient.request(query, variable);
    if (!response) {
      throw response;
    }
    return {
      status: "success",
      data: response,
      message: ""
    };

  } catch (e) {
    const { message, extensions } = e.response.errors[0];
    if (message === "graphql-authorization") {
      return window.location.replace(process.env.REACT_APP_BO_ENDPOINT);
    }
    return {
      status: "failed",
      data: null,
      message: extensions.message
    };
  }
}

export { GQLClientRequest };