export interface IGitInfoCardProps {
  data: {
    branch: string;
    commit: {
      author: string;
      hash: string;
      timestamp: string;
    };
    remote_origin_url: string;
  };
}
